import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

interface AddImagePayload {
  name: string;
  registry_url: string | null;
}

export function useImages(filters: {
  search: string;
  severity: string;
  lastScan: string;
}) {
  const queryClient = useQueryClient();

  const imagesQuery = useQuery({
    queryKey: ['images', filters],
    queryFn: async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('User not authenticated');

      let query = supabase
        .from('container_images')
        .select(`
          *,
          scan_history(
            scan_started_at,
            scan_completed_at,
            vulnerabilities_found
          )
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      if (filters.severity !== 'all') {
        switch (filters.severity) {
          case 'critical':
            query = query.gt('critical_vulnerabilities', 0);
            break;
          case 'high':
            query = query.gt('high_vulnerabilities', 0);
            break;
          case 'medium':
            query = query.gt('medium_vulnerabilities', 0);
            break;
        }
      }

      if (filters.lastScan !== 'all') {
        const now = new Date();
        let dateFilter = now;
        
        switch (filters.lastScan) {
          case 'today':
            dateFilter.setHours(0, 0, 0, 0);
            break;
          case 'week':
            dateFilter.setDate(dateFilter.getDate() - 7);
            break;
          case 'month':
            dateFilter.setMonth(dateFilter.getMonth() - 1);
            break;
        }

        query = query.gte('last_scan', dateFilter.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  const deleteImage = useMutation({
    mutationFn: async (imageId: string) => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('User not authenticated');

      // First delete related scan history
      const { error: scanHistoryError } = await supabase
        .from('scan_history')
        .delete()
        .eq('image_id', imageId)
        .eq('user_id', user.id);

      if (scanHistoryError) throw scanHistoryError;

      // Then delete the image
      const { error: imageError } = await supabase
        .from('container_images')
        .delete()
        .eq('id', imageId)
        .eq('user_id', user.id);

      if (imageError) throw imageError;
    },
    onMutate: async (imageId) => {
      await queryClient.cancelQueries({ queryKey: ['images'] });
      const previousImages = queryClient.getQueryData(['images']);
      queryClient.setQueryData(['images'], (old: any[]) => 
        old?.filter(image => image.id !== imageId)
      );
      return { previousImages };
    },
    onError: (err, imageId, context) => {
      queryClient.setQueryData(['images'], context?.previousImages);
      toast.error(err instanceof Error ? err.message : 'Failed to delete image');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['images'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      toast.success('Image deleted successfully');
    },
  });

  const addImage = useMutation({
    mutationFn: async (payload: AddImagePayload) => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('User not authenticated');

      const { data: existingImages, error: existingError } = await supabase
        .from('container_images')
        .select('id')
        .eq('name', payload.name)
        .eq('user_id', user.id);

      if (existingError) throw existingError;
      
      if (existingImages && existingImages.length > 0) {
        throw new Error('An image with this name already exists in your account');
      }

      const { data, error } = await supabase
        .from('container_images')
        .insert({
          name: payload.name,
          registry_url: payload.registry_url,
          status: 'pending',
          user_id: user.id,
          critical_vulnerabilities: 0,
          high_vulnerabilities: 0,
          medium_vulnerabilities: 0,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('An image with this name already exists');
        }
        throw error;
      }

      const { error: scanError } = await supabase
        .from('scan_history')
        .insert({
          image_id: data.id,
          status: 'pending',
          user_id: user.id,
        });

      if (scanError) throw scanError;

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['images'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      toast.success(`Image ${data.name} added successfully`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to add image');
    },
  });

  const startScan = useMutation({
    mutationFn: async (imageId: string) => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('User not authenticated');

      // Verify the image belongs to the user
      const { data: images, error: imageError } = await supabase
        .from('container_images')
        .select('id')
        .eq('id', imageId)
        .eq('user_id', user.id);

      if (imageError) throw imageError;
      if (!images || images.length === 0) {
        throw new Error('Image not found or access denied');
      }

      // Start the scan by updating the image status
      const { error: updateError } = await supabase
        .from('container_images')
        .update({ 
          status: 'scanning',
          last_scan: new Date().toISOString(),
        })
        .eq('id', imageId)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Create new scan history entry
      const { error: scanError } = await supabase
        .from('scan_history')
        .insert({
          image_id: imageId,
          status: 'scanning',
          user_id: user.id,
        });

      if (scanError) throw scanError;

      // Trigger the scan simulator
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scan-simulator`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to trigger scan simulator');
        }
      } catch (error) {
        console.error('Error triggering scan simulator:', error);
        // Don't throw here - we want the scan to continue even if the simulator fails
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['images'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      toast.success('Scan started successfully');
    },
    onError: (error) => {
      toast.error(`Failed to start scan: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });

  const refreshImages = () => {
    queryClient.invalidateQueries({ queryKey: ['images'] });
    queryClient.invalidateQueries({ queryKey: ['stats'] });
    toast.success('Refreshing images...');
  };

  return {
    images: imagesQuery.data || [],
    isLoading: imagesQuery.isLoading,
    error: imagesQuery.error,
    startScan,
    refreshImages,
    addImage,
    deleteImage,
    isAddingImage: addImage.isPending,
  };
}
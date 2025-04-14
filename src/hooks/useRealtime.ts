import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

export function useRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Subscribe to container_images changes
    const imagesSubscription = supabase
      .channel('container_images_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'container_images',
        },
        (payload) => {
          // Invalidate queries
          queryClient.invalidateQueries({ queryKey: ['images'] });
          queryClient.invalidateQueries({ queryKey: ['stats'] });

          // Show notifications for important changes
          if (payload.eventType === 'UPDATE') {
            const newStatus = payload.new.status;
            const oldStatus = payload.old.status;

            if (newStatus !== oldStatus) {
              if (newStatus === 'scanning') {
                toast.loading(`Scanning ${payload.new.name}...`, { 
                  id: `scan-${payload.new.id}`,
                  duration: Infinity 
                });
              } else if (newStatus === 'complete') {
                toast.success(`Scan completed for ${payload.new.name}`, { 
                  id: `scan-${payload.new.id}` 
                });
              } else if (newStatus === 'failed') {
                toast.error(`Scan failed for ${payload.new.name}`, { 
                  id: `scan-${payload.new.id}` 
                });
              }
            }

            // Update vulnerability counts
            if (
              payload.new.critical_vulnerabilities !== payload.old.critical_vulnerabilities ||
              payload.new.high_vulnerabilities !== payload.old.high_vulnerabilities ||
              payload.new.medium_vulnerabilities !== payload.old.medium_vulnerabilities
            ) {
              queryClient.invalidateQueries({ queryKey: ['stats'] });
            }
          } else if (payload.eventType === 'INSERT') {
            toast.success(`New image added: ${payload.new.name}`);
            queryClient.invalidateQueries({ queryKey: ['stats'] });
          } else if (payload.eventType === 'DELETE') {
            toast.info(`Image removed: ${payload.old.name}`);
            queryClient.invalidateQueries({ queryKey: ['stats'] });
          }
        }
      )
      .subscribe();

    // Subscribe to scan_history changes
    const scanHistorySubscription = supabase
      .channel('scan_history_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scan_history',
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['stats'] });
          
          if (payload.eventType === 'INSERT') {
            queryClient.invalidateQueries({ queryKey: ['images'] });
          }
        }
      )
      .subscribe();

    return () => {
      imagesSubscription.unsubscribe();
      scanHistorySubscription.unsubscribe();
    };
  }, [queryClient]);
}
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('User not authenticated');

      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const lastMonth = new Date(today);
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      // Get current stats
      const [totalImages, criticalVulnerabilities, highVulnerabilities, scannedToday] = await Promise.all([
        supabase
          .from('container_images')
          .select('count', { count: 'exact', head: true })
          .eq('user_id', user.id),
        supabase
          .from('container_images')
          .select('count', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gt('critical_vulnerabilities', 0),
        supabase
          .from('container_images')
          .select('count', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gt('high_vulnerabilities', 0),
        supabase
          .from('scan_history')
          .select('count', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('scan_started_at', yesterday.toISOString()),
      ]);

      // Get historical data for comparison
      const [lastMonthImages, yesterdayScans] = await Promise.all([
        supabase
          .from('container_images')
          .select('count', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .lte('created_at', lastMonth.toISOString()),
        supabase
          .from('scan_history')
          .select('count', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('scan_started_at', yesterday.toISOString())
          .lte('scan_started_at', today.toISOString()),
      ]);

      // Calculate percentage changes
      const calculateChange = (current: number, previous: number): number => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return Math.round(((current - previous) / previous) * 100);
      };

      // Get last month's vulnerability counts for comparison
      const [lastMonthCritical, lastMonthHigh] = await Promise.all([
        supabase
          .from('container_images')
          .select('count', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gt('critical_vulnerabilities', 0)
          .lte('created_at', lastMonth.toISOString()),
        supabase
          .from('container_images')
          .select('count', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gt('high_vulnerabilities', 0)
          .lte('created_at', lastMonth.toISOString()),
      ]);

      return {
        totalImages: { 
          value: totalImages.count || 0,
          change: calculateChange(
            totalImages.count || 0,
            lastMonthImages.count || 0
          ),
          period: 'last month'
        },
        criticalIssues: {
          value: criticalVulnerabilities.count || 0,
          change: calculateChange(
            criticalVulnerabilities.count || 0,
            lastMonthCritical.count || 0
          ),
          period: 'last month'
        },
        highRisk: {
          value: highVulnerabilities.count || 0,
          change: calculateChange(
            highVulnerabilities.count || 0,
            lastMonthHigh.count || 0
          ),
          period: 'last month'
        },
        scannedToday: {
          value: scannedToday.count || 0,
          change: calculateChange(
            scannedToday.count || 0,
            yesterdayScans.count || 0
          ),
          period: 'yesterday'
        },
      };
    },
    refetchInterval: 5000, // Refetch every 5 seconds for more responsive updates
  });
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SiteSetting } from '@/types/cms';
import { toast } from 'sonner';

export const useSiteSettings = () => {
  const queryClient = useQueryClient();

  // Fetch all site settings
  const { data: settings = [], isLoading } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .order('setting_key');
      
      if (error) throw error;
      return data as SiteSetting[];
    },
  });

  // Update setting mutation
  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const { data, error } = await supabase
        .from('site_settings')
        .upsert({
          setting_key: key,
          setting_value: value,
          category: 'general'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast.success('Setting updated successfully');
    },
    onError: (error) => {
      console.error('Error updating setting:', error);
      toast.error('Failed to update setting');
    },
  });

  // Helper functions
  const getSetting = (key: string, defaultValue?: any) => {
    const setting = settings.find(s => s.setting_key === key);
    return setting ? setting.setting_value : defaultValue;
  };

  const updateSetting = (key: string, value: any) => {
    updateSettingMutation.mutate({ key, value });
  };

  const getSettingsByCategory = (category: string) => {
    return settings.filter(s => s.category === category);
  };

  return {
    settings,
    isLoading,
    getSetting,
    updateSetting,
    getSettingsByCategory,
  };
};

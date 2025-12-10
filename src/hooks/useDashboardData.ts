import { useQuery, useQueryClient } from '@tanstack/react-query';
import { sites as mockSites } from '@/data/seed-data';
import { generateAISuggestions } from '@/utils/aiSuggestionAnalyzer';
import { Site, AISuggestion } from '@/types';
import { useTenant } from '@/contexts/TenantContext';

// Simulate API calls with mock data
const fetchSites = async (): Promise<Site[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return mockSites;
};

const fetchSuggestions = async (sites: Site[]): Promise<AISuggestion[]> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  return generateAISuggestions(sites);
};

export function useSites() {
  const { currentTenant } = useTenant();
  
  return useQuery({
    queryKey: ['sites', currentTenant?.id],
    queryFn: fetchSites,
    select: (data) => currentTenant 
      ? data.filter(site => site.tenantId === currentTenant.id)
      : data,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useSuggestions(sites: Site[] = []) {
  return useQuery({
    queryKey: ['suggestions', sites.map(s => s.id)],
    queryFn: () => fetchSuggestions(sites),
    enabled: sites.length > 0,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useDashboardRefresh() {
  const queryClient = useQueryClient();
  
  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['sites'] });
    await queryClient.invalidateQueries({ queryKey: ['suggestions'] });
  };
  
  return { refresh };
}

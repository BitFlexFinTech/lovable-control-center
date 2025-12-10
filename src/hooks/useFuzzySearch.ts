import { useMemo } from 'react';
import { useSites, useTenants, useUsersWithRoles } from './useSupabaseQuery';

export interface SearchResult {
  id: string;
  type: 'site' | 'tenant' | 'user';
  title: string;
  subtitle: string;
  path: string;
}

export const useFuzzySearch = (query: string) => {
  const { data: sites } = useSites();
  const { data: tenants } = useTenants();
  const { data: users } = useUsersWithRoles();

  const results = useMemo(() => {
    if (!query || query.length < 2) return [];

    const searchResults: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();

    // Search sites
    sites?.forEach((site) => {
      const nameMatch = site.name.toLowerCase().includes(lowerQuery);
      const domainMatch = site.domain?.toLowerCase().includes(lowerQuery);
      
      if (nameMatch || domainMatch) {
        searchResults.push({
          id: site.id,
          type: 'site',
          title: site.name,
          subtitle: site.domain || 'No domain',
          path: `/sites?highlight=${site.id}`,
        });
      }
    });

    // Search tenants
    tenants?.forEach((tenant) => {
      const nameMatch = tenant.name.toLowerCase().includes(lowerQuery);
      const slugMatch = tenant.slug.toLowerCase().includes(lowerQuery);
      
      if (nameMatch || slugMatch) {
        searchResults.push({
          id: tenant.id,
          type: 'tenant',
          title: tenant.name,
          subtitle: tenant.slug,
          path: `/tenants?highlight=${tenant.id}`,
        });
      }
    });

    // Search users
    users?.forEach((user) => {
      const nameMatch = user.full_name?.toLowerCase().includes(lowerQuery);
      const emailMatch = user.email?.toLowerCase().includes(lowerQuery);
      
      if (nameMatch || emailMatch) {
        searchResults.push({
          id: user.user_id,
          type: 'user',
          title: user.full_name || 'Unknown User',
          subtitle: user.email || '',
          path: `/users?highlight=${user.user_id}`,
        });
      }
    });

    // Sort by relevance (exact matches first)
    return searchResults.sort((a, b) => {
      const aExact = a.title.toLowerCase() === lowerQuery || a.subtitle.toLowerCase() === lowerQuery;
      const bExact = b.title.toLowerCase() === lowerQuery || b.subtitle.toLowerCase() === lowerQuery;
      
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      
      const aStartsWith = a.title.toLowerCase().startsWith(lowerQuery);
      const bStartsWith = b.title.toLowerCase().startsWith(lowerQuery);
      
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      
      return 0;
    }).slice(0, 10);
  }, [query, sites, tenants, users]);

  return results;
};
// CSV Export utilities

export const downloadCSV = (data: Record<string, any>[], filename: string) => {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle values with commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
};

export const downloadJSON = (data: any, filename: string) => {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
};

export const formatAuditLogForExport = (log: {
  id: string;
  action: string;
  resource: string;
  user_id?: string;
  tenant_id?: string;
  details?: Record<string, unknown>;
  created_at: string;
}) => ({
  id: log.id,
  timestamp: new Date(log.created_at).toISOString(),
  action: log.action,
  resource: log.resource,
  user_id: log.user_id || '',
  tenant_id: log.tenant_id || '',
  details: log.details ? JSON.stringify(log.details) : '',
});

export const formatSiteForExport = (site: {
  id: string;
  name: string;
  domain?: string | null;
  status?: string | null;
  health_status?: string | null;
  uptime_percentage?: number | null;
  response_time_ms?: number | null;
  ssl_status?: string | null;
  created_at: string;
}) => ({
  id: site.id,
  name: site.name,
  domain: site.domain || '',
  status: site.status || '',
  health_status: site.health_status || '',
  uptime_percentage: site.uptime_percentage ?? 100,
  response_time_ms: site.response_time_ms ?? 0,
  ssl_status: site.ssl_status || '',
  created_at: new Date(site.created_at).toISOString(),
});

export const maskCredential = (value: string, showFirst = 4): string => {
  if (!value || value.length <= showFirst) return '••••••••';
  return value.slice(0, showFirst) + '••••••••';
};

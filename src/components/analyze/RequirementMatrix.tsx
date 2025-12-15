import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChevronUp,
  ChevronDown,
  Search,
  Download,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Filter,
  Table as TableIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SiteAnalysisReport, SiteRequirement } from '@/utils/analyzeSystemPrompt';

interface MatrixRow {
  requirementId: string;
  siteId: string;
  siteName: string;
  siteColor: string;
  title: string;
  status: 'implemented' | 'partial' | 'not-implemented';
  implementationRefs: string[];
  testNames: string[];
  selected: boolean;
}

interface RequirementMatrixProps {
  siteReports: SiteAnalysisReport[];
  onToggleRequirement: (siteId: string, reqId: string) => void;
}

type SortField = 'requirementId' | 'siteName' | 'status' | 'title';
type SortDirection = 'asc' | 'desc';

export function RequirementMatrix({ siteReports, onToggleRequirement }: RequirementMatrixProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [siteFilter, setSiteFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('requirementId');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Flatten all requirements into rows
  const allRows = useMemo<MatrixRow[]>(() => {
    const rows: MatrixRow[] = [];
    
    siteReports.forEach(report => {
      report.requirements.forEach(req => {
        rows.push({
          requirementId: req.id,
          siteId: report.siteId,
          siteName: report.siteName,
          siteColor: report.siteColor,
          title: req.title,
          status: req.status,
          implementationRefs: [
            ...req.evidence.files,
            ...req.evidence.functions,
            ...req.evidence.routes,
          ].filter(Boolean),
          testNames: req.testNames,
          selected: req.selected,
        });
      });
    });
    
    return rows;
  }, [siteReports]);

  // Get unique sites for filter
  const uniqueSites = useMemo(() => {
    const sites = new Map<string, { id: string; name: string; color: string }>();
    siteReports.forEach(r => {
      sites.set(r.siteId, { id: r.siteId, name: r.siteName, color: r.siteColor });
    });
    return Array.from(sites.values());
  }, [siteReports]);

  // Filter and sort rows
  const filteredRows = useMemo(() => {
    let filtered = allRows;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(row => 
        row.requirementId.toLowerCase().includes(query) ||
        row.title.toLowerCase().includes(query) ||
        row.siteName.toLowerCase().includes(query) ||
        row.implementationRefs.some(ref => ref.toLowerCase().includes(query)) ||
        row.testNames.some(test => test.toLowerCase().includes(query))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(row => row.status === statusFilter);
    }

    // Site filter
    if (siteFilter !== 'all') {
      filtered = filtered.filter(row => row.siteId === siteFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'requirementId':
          comparison = a.requirementId.localeCompare(b.requirementId);
          break;
        case 'siteName':
          comparison = a.siteName.localeCompare(b.siteName);
          break;
        case 'status':
          const statusOrder = { 'not-implemented': 0, 'partial': 1, 'implemented': 2 };
          comparison = statusOrder[a.status] - statusOrder[b.status];
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [allRows, searchQuery, statusFilter, siteFilter, sortField, sortDirection]);

  // Toggle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Export to CSV
  const exportToCsv = () => {
    const headers = ['Requirement ID', 'Site', 'Title', 'Status', 'Implementation Refs', 'Test Names'];
    const rows = filteredRows.map(row => [
      row.requirementId,
      row.siteName,
      row.title,
      row.status,
      row.implementationRefs.join('; '),
      row.testNames.join('; '),
    ]);
    
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `requirement-matrix-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4 inline ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 inline ml-1" />
    );
  };

  const StatusBadge = ({ status }: { status: MatrixRow['status'] }) => {
    const config = {
      'implemented': { icon: CheckCircle2, className: 'bg-green-500/10 text-green-500 border-green-500/30' },
      'partial': { icon: AlertTriangle, className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' },
      'not-implemented': { icon: XCircle, className: 'bg-red-500/10 text-red-500 border-red-500/30' },
    };
    const { icon: Icon, className } = config[status];
    return (
      <Badge variant="outline" className={cn('gap-1', className)}>
        <Icon className="h-3 w-3" />
        {status.replace('-', ' ')}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TableIcon className="h-5 w-5 text-primary" />
            Requirement Traceability Matrix
          </CardTitle>
          <Button variant="outline" size="sm" onClick={exportToCsv} className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search requirements, tests, or files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="implemented">Implemented</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
              <SelectItem value="not-implemented">Not Implemented</SelectItem>
            </SelectContent>
          </Select>

          <Select value={siteFilter} onValueChange={setSiteFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Sites" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sites</SelectItem>
              {uniqueSites.map(site => (
                <SelectItem key={site.id} value={site.id}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: site.color }} 
                    />
                    {site.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results count */}
        <div className="text-sm text-muted-foreground mb-3">
          Showing {filteredRows.length} of {allRows.length} requirements
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[40px]">
                  <span className="sr-only">Select</span>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/80 transition-colors"
                  onClick={() => handleSort('requirementId')}
                >
                  Requirement ID <SortIcon field="requirementId" />
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/80 transition-colors"
                  onClick={() => handleSort('siteName')}
                >
                  Site <SortIcon field="siteName" />
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/80 transition-colors min-w-[200px]"
                  onClick={() => handleSort('title')}
                >
                  Title <SortIcon field="title" />
                </TableHead>
                <TableHead>Implementation Refs</TableHead>
                <TableHead>Test Names</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/80 transition-colors"
                  onClick={() => handleSort('status')}
                >
                  Status <SortIcon field="status" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No requirements match your filters
                  </TableCell>
                </TableRow>
              ) : (
                filteredRows.map(row => (
                  <TableRow 
                    key={`${row.siteId}-${row.requirementId}`}
                    className={cn(row.selected && 'bg-primary/5')}
                  >
                    <TableCell>
                      <Checkbox
                        checked={row.selected}
                        onCheckedChange={() => onToggleRequirement(row.siteId, row.requirementId)}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {row.requirementId}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2 h-2 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: row.siteColor }} 
                        />
                        <span className="truncate max-w-[120px]">{row.siteName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="line-clamp-2">{row.title}</span>
                    </TableCell>
                    <TableCell>
                      {row.implementationRefs.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {row.implementationRefs.slice(0, 2).map((ref, i) => (
                            <Badge key={i} variant="secondary" className="text-xs gap-1">
                              <FileCode className="h-3 w-3" />
                              {ref}
                            </Badge>
                          ))}
                          {row.implementationRefs.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{row.implementationRefs.length - 2}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {row.testNames.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {row.testNames.slice(0, 2).map((test, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {test}
                            </Badge>
                          ))}
                          {row.testNames.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{row.testNames.length - 2}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={row.status} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
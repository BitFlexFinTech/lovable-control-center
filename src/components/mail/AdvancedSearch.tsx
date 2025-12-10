import { useState } from 'react';
import { Search, Filter, X, Paperclip, Star, Flag, Mail as MailIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchFilter {
  hasAttachments: boolean;
  isStarred: boolean;
  isFlagged: boolean;
  isUnread: boolean;
  from: string;
  to: string;
  subject: string;
  dateRange: 'any' | 'today' | 'week' | 'month';
}

interface AdvancedSearchProps {
  onSearch: (query: string, filters: SearchFilter) => void;
  resultCount?: number;
}

const defaultFilters: SearchFilter = {
  hasAttachments: false,
  isStarred: false,
  isFlagged: false,
  isUnread: false,
  from: '',
  to: '',
  subject: '',
  dateRange: 'any',
};

export const AdvancedSearch = ({ onSearch, resultCount }: AdvancedSearchProps) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilter>(defaultFilters);
  const [isOpen, setIsOpen] = useState(false);
  
  const debouncedQuery = useDebounce(query, 300);

  // Parse special syntax in query
  const parseQuery = (q: string): { text: string; parsed: Partial<SearchFilter> } => {
    const parsed: Partial<SearchFilter> = {};
    let text = q;

    // Parse from:
    const fromMatch = q.match(/from:(\S+)/i);
    if (fromMatch) {
      parsed.from = fromMatch[1];
      text = text.replace(fromMatch[0], '').trim();
    }

    // Parse to:
    const toMatch = q.match(/to:(\S+)/i);
    if (toMatch) {
      parsed.to = toMatch[1];
      text = text.replace(toMatch[0], '').trim();
    }

    // Parse has:attachments
    if (q.includes('has:attachments') || q.includes('has:attachment')) {
      parsed.hasAttachments = true;
      text = text.replace(/has:attachments?/gi, '').trim();
    }

    // Parse is:starred
    if (q.includes('is:starred')) {
      parsed.isStarred = true;
      text = text.replace(/is:starred/gi, '').trim();
    }

    // Parse is:unread
    if (q.includes('is:unread')) {
      parsed.isUnread = true;
      text = text.replace(/is:unread/gi, '').trim();
    }

    // Parse is:flagged
    if (q.includes('is:flagged')) {
      parsed.isFlagged = true;
      text = text.replace(/is:flagged/gi, '').trim();
    }

    return { text, parsed };
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    const { text, parsed } = parseQuery(value);
    const mergedFilters = { ...filters, ...parsed };
    onSearch(text, mergedFilters);
  };

  const handleFilterChange = (key: keyof SearchFilter, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onSearch(query, newFilters);
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    setQuery('');
    onSearch('', defaultFilters);
  };

  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'dateRange') return value !== 'any';
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.length > 0;
    return false;
  }).length;

  const addSyntax = (syntax: string) => {
    const newQuery = query ? `${query} ${syntax}` : syntax;
    handleQueryChange(newQuery);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search emails... (try from:, has:attachments, is:starred)"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          className="w-full h-9 pl-9 pr-4 bg-secondary border border-transparent rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
        />
        {query && (
          <button
            onClick={() => handleQueryChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5 relative">
            <Filter className="h-3.5 w-3.5" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="default" className="h-4 w-4 p-0 text-[10px] absolute -top-1.5 -right-1.5">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Advanced Filters</h4>
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear all
                </Button>
              )}
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Quick Filters</Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={filters.hasAttachments ? 'default' : 'outline'}
                    size="sm"
                    className="gap-1.5 h-7 text-xs"
                    onClick={() => handleFilterChange('hasAttachments', !filters.hasAttachments)}
                  >
                    <Paperclip className="h-3 w-3" />
                    Attachments
                  </Button>
                  <Button
                    variant={filters.isStarred ? 'default' : 'outline'}
                    size="sm"
                    className="gap-1.5 h-7 text-xs"
                    onClick={() => handleFilterChange('isStarred', !filters.isStarred)}
                  >
                    <Star className="h-3 w-3" />
                    Starred
                  </Button>
                  <Button
                    variant={filters.isFlagged ? 'default' : 'outline'}
                    size="sm"
                    className="gap-1.5 h-7 text-xs"
                    onClick={() => handleFilterChange('isFlagged', !filters.isFlagged)}
                  >
                    <Flag className="h-3 w-3" />
                    Flagged
                  </Button>
                  <Button
                    variant={filters.isUnread ? 'default' : 'outline'}
                    size="sm"
                    className="gap-1.5 h-7 text-xs"
                    onClick={() => handleFilterChange('isUnread', !filters.isUnread)}
                  >
                    <MailIcon className="h-3 w-3" />
                    Unread
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">From</Label>
                <Input
                  placeholder="sender@example.com"
                  value={filters.from}
                  onChange={(e) => handleFilterChange('from', e.target.value)}
                  className="h-8 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Subject Contains</Label>
                <Input
                  placeholder="meeting, invoice, etc."
                  value={filters.subject}
                  onChange={(e) => handleFilterChange('subject', e.target.value)}
                  className="h-8 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Date Range</Label>
                <div className="flex gap-2">
                  {(['any', 'today', 'week', 'month'] as const).map((range) => (
                    <Button
                      key={range}
                      variant={filters.dateRange === range ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1 h-7 text-xs capitalize"
                      onClick={() => handleFilterChange('dateRange', range)}
                    >
                      {range}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                Tip: Use syntax like <code className="bg-muted px-1 rounded">from:john</code>,{' '}
                <code className="bg-muted px-1 rounded">has:attachments</code>,{' '}
                <code className="bg-muted px-1 rounded">is:starred</code>
              </p>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {resultCount !== undefined && (
        <Badge variant="secondary" className="text-xs">
          {resultCount} result{resultCount !== 1 ? 's' : ''}
        </Badge>
      )}
    </div>
  );
};

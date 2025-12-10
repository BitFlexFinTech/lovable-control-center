import { useLocation, Link } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Home } from 'lucide-react';

const routeLabels: Record<string, string> = {
  '': 'Overview',
  'mail': 'Mail',
  'social-prefill': 'Social Prefill',
  'passwords': 'Password Manager',
  'tenants': 'Tenants',
  'sites': 'Sites',
  'users': 'Users',
  'roles': 'Roles',
  'integrations': 'Integrations',
  'audit-logs': 'Audit Logs',
  'settings': 'Settings',
  'guided-tour': 'Guided Tour',
  'auth': 'Authentication',
};

export const Breadcrumbs = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  // Don't show breadcrumbs on auth page
  if (location.pathname === '/auth') {
    return null;
  }

  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = '/' + pathSegments.slice(0, index + 1).join('/');
    const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    const isLast = index === pathSegments.length - 1;

    return { path, label, isLast };
  });

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/" className="flex items-center gap-1.5 hover:text-foreground transition-colors">
              <Home className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only">Home</span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {breadcrumbs.map(({ path, label, isLast }) => (
          <BreadcrumbItem key={path}>
            <BreadcrumbSeparator />
            {isLast ? (
              <BreadcrumbPage>{label}</BreadcrumbPage>
            ) : (
              <BreadcrumbLink asChild>
                <Link to={path}>{label}</Link>
              </BreadcrumbLink>
            )}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

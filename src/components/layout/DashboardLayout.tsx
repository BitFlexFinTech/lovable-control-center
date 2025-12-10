import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { Breadcrumbs } from './Breadcrumbs';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="pl-0 md:pl-60">
        <TopBar />
        <main className="p-4 md:p-6 animate-fade-in">
          <Breadcrumbs />
          {children}
        </main>
      </div>
    </div>
  );
}

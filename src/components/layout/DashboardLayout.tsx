import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { Breadcrumbs } from './Breadcrumbs';
import { SocialFeedPanel } from '../dashboard/SocialFeedPanel';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      {/* Fixed Right Social Panel - mirrors left sidebar */}
      <aside className="fixed right-0 top-0 h-screen w-[380px] bg-sidebar border-l border-sidebar-border hidden lg:flex flex-col z-40">
        <SocialFeedPanel />
      </aside>
      
      <div className="pl-0 md:pl-60 lg:pr-[380px]">
        <TopBar />
        <main className="p-4 md:p-6 animate-fade-in">
          <Breadcrumbs />
          {children}
        </main>
      </div>
    </div>
  );
}

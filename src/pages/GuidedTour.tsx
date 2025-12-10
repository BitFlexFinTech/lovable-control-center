import { useState } from 'react';
import { BookOpen, MessageSquare, Sparkles } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TourLibrary } from '@/components/tour/TourLibrary';
import { TourChat } from '@/components/tour/TourChat';
import { cn } from '@/lib/utils';

type TabType = 'library' | 'chat';

const GuidedTour = () => {
  const [activeTab, setActiveTab] = useState<TabType>('library');

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6 opacity-0 animate-fade-in">
        <div className="flex items-center gap-3 mb-1">
          <Sparkles className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight">Guided Tour</h1>
        </div>
        <p className="text-muted-foreground">
          Interactive tutorials and AI-powered help to master Control Center
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 mb-6 opacity-0 animate-slide-up" style={{ animationDelay: '50ms' }}>
        <button
          onClick={() => setActiveTab('library')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
            activeTab === 'library'
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          )}
        >
          <BookOpen className="h-4 w-4" />
          Tour Library
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
            activeTab === 'chat'
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          )}
        >
          <MessageSquare className="h-4 w-4" />
          AI Assistant
        </button>
      </div>

      {/* Content */}
      <div 
        className="rounded-xl border border-border bg-card overflow-hidden opacity-0 animate-slide-up"
        style={{ animationDelay: '100ms', height: 'calc(100vh - 280px)' }}
      >
        {activeTab === 'library' && <TourLibrary />}
        {activeTab === 'chat' && <TourChat />}
      </div>
    </DashboardLayout>
  );
};

export default GuidedTour;

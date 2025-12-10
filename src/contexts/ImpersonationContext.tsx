import React, { createContext, useContext, useState, useEffect } from 'react';
import { useImpersonationSessions, useStartImpersonation, useEndImpersonation, useCreateAuditLog } from '@/hooks/useSupabaseQuery';
import { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface ImpersonationSession {
  id: string;
  impersonated_role: AppRole;
  started_at: string;
  reason: string | null;
}

interface ImpersonationContextType {
  isImpersonating: boolean;
  currentSession: ImpersonationSession | null;
  impersonatedRole: AppRole | null;
  startImpersonation: (role: AppRole, reason?: string) => Promise<void>;
  endImpersonation: () => Promise<void>;
}

const ImpersonationContext = createContext<ImpersonationContextType | null>(null);

export const useImpersonation = () => {
  const context = useContext(ImpersonationContext);
  if (!context) {
    throw new Error('useImpersonation must be used within ImpersonationProvider');
  }
  return context;
};

export const ImpersonationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: sessions } = useImpersonationSessions();
  const startMutation = useStartImpersonation();
  const endMutation = useEndImpersonation();
  const createAuditLog = useCreateAuditLog();
  const [currentSession, setCurrentSession] = useState<ImpersonationSession | null>(null);

  useEffect(() => {
    if (sessions && sessions.length > 0) {
      const activeSession = sessions[0];
      setCurrentSession({
        id: activeSession.id,
        impersonated_role: activeSession.impersonated_role,
        started_at: activeSession.started_at,
        reason: activeSession.reason,
      });
    } else {
      setCurrentSession(null);
    }
  }, [sessions]);

  const startImpersonation = async (role: AppRole, reason?: string) => {
    const result = await startMutation.mutateAsync({ role, reason });
    
    await createAuditLog.mutateAsync({
      action: 'impersonation_started',
      resource: 'admin_impersonation_sessions',
      resource_id: (result as any)?.id,
      details: { impersonated_role: role, reason },
    });
  };

  const endImpersonation = async () => {
    if (!currentSession) return;
    
    await endMutation.mutateAsync(currentSession.id);
    
    await createAuditLog.mutateAsync({
      action: 'impersonation_ended',
      resource: 'admin_impersonation_sessions',
      resource_id: currentSession.id,
      details: { 
        impersonated_role: currentSession.impersonated_role,
        duration_ms: Date.now() - new Date(currentSession.started_at).getTime(),
      },
    });
  };

  return (
    <ImpersonationContext.Provider
      value={{
        isImpersonating: !!currentSession,
        currentSession,
        impersonatedRole: currentSession?.impersonated_role || null,
        startImpersonation,
        endImpersonation,
      }}
    >
      {children}
    </ImpersonationContext.Provider>
  );
};
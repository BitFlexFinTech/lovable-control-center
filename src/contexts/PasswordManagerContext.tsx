import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { StoredCredential, CredentialStatus, IntegrationSource } from '@/types/credentials';
import { generateControlCenterCredentials } from '@/utils/integrationAccountGenerator';

interface PasswordManagerContextType {
  credentials: StoredCredential[];
  
  // CRUD operations
  addCredential: (credential: StoredCredential) => void;
  updateCredential: (id: string, updates: Partial<StoredCredential>) => void;
  deleteCredential: (id: string) => void;
  
  // Bulk operations
  addCredentialsForSite: (credentials: StoredCredential[]) => void;
  promoteToLive: (siteId: string) => void;
  
  // Queries
  getDemoCredentials: () => StoredCredential[];
  getLiveCredentials: () => StoredCredential[];
  getCredentialsBySite: (siteId: string) => StoredCredential[];
  getControlCenterCredentials: () => StoredCredential[];
  getCreatedSiteCredentials: () => StoredCredential[];
  getCredentialsByStatus: (status: CredentialStatus) => StoredCredential[];
  
  // Stats
  getDemoCount: () => number;
  getLiveCount: () => number;
  getTotalCount: () => number;
}

const PasswordManagerContext = createContext<PasswordManagerContextType | undefined>(undefined);

export function PasswordManagerProvider({ children }: { children: ReactNode }) {
  const [credentials, setCredentials] = useState<StoredCredential[]>(() => {
    // Initialize with Control Center credentials
    return generateControlCenterCredentials();
  });

  const addCredential = (credential: StoredCredential) => {
    setCredentials(prev => [...prev, credential]);
  };

  const updateCredential = (id: string, updates: Partial<StoredCredential>) => {
    setCredentials(prev => prev.map(cred => 
      cred.id === id 
        ? { ...cred, ...updates, updatedAt: new Date().toISOString() }
        : cred
    ));
  };

  const deleteCredential = (id: string) => {
    setCredentials(prev => prev.filter(cred => cred.id !== id));
  };

  const addCredentialsForSite = (newCredentials: StoredCredential[]) => {
    setCredentials(prev => [...prev, ...newCredentials]);
  };

  const promoteToLive = (siteId: string) => {
    setCredentials(prev => prev.map(cred =>
      cred.siteId === siteId
        ? { ...cred, status: 'live' as CredentialStatus, updatedAt: new Date().toISOString() }
        : cred
    ));
  };

  const getDemoCredentials = () => credentials.filter(c => c.status === 'demo');
  const getLiveCredentials = () => credentials.filter(c => c.status === 'live');
  const getCredentialsBySite = (siteId: string) => credentials.filter(c => c.siteId === siteId);
  const getControlCenterCredentials = () => credentials.filter(c => c.source === 'control-center');
  const getCreatedSiteCredentials = () => credentials.filter(c => c.source === 'created-site');
  const getCredentialsByStatus = (status: CredentialStatus) => credentials.filter(c => c.status === status);

  const getDemoCount = () => credentials.filter(c => c.status === 'demo').length;
  const getLiveCount = () => credentials.filter(c => c.status === 'live').length;
  const getTotalCount = () => credentials.length;

  return (
    <PasswordManagerContext.Provider value={{
      credentials,
      addCredential,
      updateCredential,
      deleteCredential,
      addCredentialsForSite,
      promoteToLive,
      getDemoCredentials,
      getLiveCredentials,
      getCredentialsBySite,
      getControlCenterCredentials,
      getCreatedSiteCredentials,
      getCredentialsByStatus,
      getDemoCount,
      getLiveCount,
      getTotalCount,
    }}>
      {children}
    </PasswordManagerContext.Provider>
  );
}

export function usePasswordManager() {
  const context = useContext(PasswordManagerContext);
  if (!context) {
    throw new Error('usePasswordManager must be used within a PasswordManagerProvider');
  }
  return context;
}

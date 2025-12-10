import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TwoFactorAccount, TOTPCode } from '@/types/twoFactor';
import { generateSecret, generateTOTP, getTimeRemaining } from '@/utils/totpGenerator';

interface TwoFactorContextType {
  accounts: TwoFactorAccount[];
  codes: Record<string, TOTPCode>;
  
  // Actions
  addAccount: (account: Omit<TwoFactorAccount, 'id' | 'secret' | 'createdAt'>) => TwoFactorAccount;
  removeAccount: (id: string) => void;
  getAccountsForSite: (siteId: string) => TwoFactorAccount[];
  
  // Stats
  getAccountCount: () => number;
}

const TwoFactorContext = createContext<TwoFactorContextType | undefined>(undefined);

// Demo 2FA accounts for existing integrations
const DEMO_2FA_ACCOUNTS: Omit<TwoFactorAccount, 'id' | 'createdAt'>[] = [
  {
    integrationId: 'stripe',
    integrationName: 'Stripe',
    integrationIcon: '💳',
    siteId: 'control-center',
    siteName: 'Control Center',
    email: 'stripe@control-center.lovable.app',
    secret: generateSecret(),
    issuer: 'Stripe',
  },
  {
    integrationId: 'github',
    integrationName: 'GitHub',
    integrationIcon: '🐙',
    siteId: 'control-center',
    siteName: 'Control Center',
    email: 'github@control-center.lovable.app',
    secret: generateSecret(),
    issuer: 'GitHub',
  },
  {
    integrationId: 'auth0',
    integrationName: 'Auth0',
    integrationIcon: '🔐',
    siteId: 'control-center',
    siteName: 'Control Center',
    email: 'auth0@control-center.lovable.app',
    secret: generateSecret(),
    issuer: 'Auth0',
  },
];

export function TwoFactorProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<TwoFactorAccount[]>(() => 
    DEMO_2FA_ACCOUNTS.map((acc, i) => ({
      ...acc,
      id: `2fa-${i + 1}`,
      createdAt: new Date().toISOString(),
    }))
  );
  const [codes, setCodes] = useState<Record<string, TOTPCode>>({});

  // Update TOTP codes every second
  useEffect(() => {
    const updateCodes = async () => {
      const newCodes: Record<string, TOTPCode> = {};
      
      for (const account of accounts) {
        const code = await generateTOTP(account.secret);
        const timeRemaining = getTimeRemaining();
        newCodes[account.id] = { code, timeRemaining, period: 30 };
      }
      
      setCodes(newCodes);
    };

    updateCodes();
    const interval = setInterval(updateCodes, 1000);
    return () => clearInterval(interval);
  }, [accounts]);

  const addAccount = (accountData: Omit<TwoFactorAccount, 'id' | 'secret' | 'createdAt'>): TwoFactorAccount => {
    const newAccount: TwoFactorAccount = {
      ...accountData,
      id: `2fa-${Date.now()}`,
      secret: generateSecret(),
      createdAt: new Date().toISOString(),
    };
    setAccounts(prev => [...prev, newAccount]);
    return newAccount;
  };

  const removeAccount = (id: string) => {
    setAccounts(prev => prev.filter(acc => acc.id !== id));
  };

  const getAccountsForSite = (siteId: string) => 
    accounts.filter(acc => acc.siteId === siteId);

  const getAccountCount = () => accounts.length;

  return (
    <TwoFactorContext.Provider value={{
      accounts,
      codes,
      addAccount,
      removeAccount,
      getAccountsForSite,
      getAccountCount,
    }}>
      {children}
    </TwoFactorContext.Provider>
  );
}

export function useTwoFactor() {
  const context = useContext(TwoFactorContext);
  if (!context) {
    throw new Error('useTwoFactor must be used within a TwoFactorProvider');
  }
  return context;
}
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Wallet, ExternalLink, CheckCircle2, Loader2 } from 'lucide-react';

interface MetaMaskConnectProps {
  onConnect: (address: string) => void;
  connectedAddress?: string | null;
}

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<string[]>;
      isMetaMask?: boolean;
    };
  }
}

export function MetaMaskConnect({ onConnect, connectedAddress }: MetaMaskConnectProps) {
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    if (typeof window.ethereum === 'undefined') {
      toast({
        title: 'MetaMask not installed',
        description: 'Please install MetaMask browser extension to connect your wallet.',
        variant: 'destructive',
      });
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const address = accounts[0];
      onConnect(address);
      toast({
        title: 'MetaMask Connected',
        description: `Connected: ${address.slice(0, 8)}...${address.slice(-6)}`,
      });
    } catch (error: any) {
      console.error('MetaMask connection error:', error);
      toast({
        title: 'Connection failed',
        description: error.message || 'Failed to connect MetaMask wallet',
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (connectedAddress) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="gap-1.5 py-1.5 px-3 bg-purple-500/10 border-purple-500/30 text-purple-400">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {formatAddress(connectedAddress)}
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.open(`https://etherscan.io/address/${connectedAddress}`, '_blank')}
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={isConnecting}
      variant="outline"
      className="gap-2 border-purple-500/30 hover:bg-purple-500/10"
    >
      {isConnecting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Wallet className="h-4 w-4 text-purple-500" />
      )}
      {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
    </Button>
  );
}

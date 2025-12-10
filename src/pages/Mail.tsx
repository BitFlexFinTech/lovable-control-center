import { useState, useMemo, useCallback, DragEvent } from 'react';
import { Search, Settings, User, Star } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MailSidebar } from '@/components/mail/MailSidebar';
import { MailList } from '@/components/mail/MailList';
import { MailDetail } from '@/components/mail/MailDetail';
import { ComposeDialog } from '@/components/mail/ComposeDialog';
import { CreateAccountDialog } from '@/components/mail/CreateAccountDialog';
import { EmailSyncDialog } from '@/components/mail/EmailSyncDialog';
import { VipManager, VipSender } from '@/components/mail/VipManager';
import { Mail, MailFolder, EmailAccount } from '@/types/mail';
import { mails as initialMails, emailAccounts as initialAccounts } from '@/data/mail-data';
import { useTenant } from '@/contexts/TenantContext';
import { useToast } from '@/hooks/use-toast';

export default function MailPage() {
  const { currentTenant } = useTenant();
  const { toast } = useToast();
  
  const [mails, setMails] = useState<Mail[]>(initialMails);
  const [accounts, setAccounts] = useState<EmailAccount[]>(initialAccounts);
  const [selectedFolder, setSelectedFolder] = useState<MailFolder>('inbox');
  const [selectedMail, setSelectedMail] = useState<Mail | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<EmailAccount | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isCreateAccountOpen, setIsCreateAccountOpen] = useState(false);
  const [isEmailSyncOpen, setIsEmailSyncOpen] = useState(false);
  const [isVipManagerOpen, setIsVipManagerOpen] = useState(false);
  const [composeMode, setComposeMode] = useState<'compose' | 'reply' | 'forward'>('compose');
  const [composeInitial, setComposeInitial] = useState({ to: '', subject: '', body: '' });
  const [vipSenders, setVipSenders] = useState<VipSender[]>([
    { email: 'notifications@stripe.com', name: 'Stripe', addedAt: new Date().toISOString() }
  ]);

  const [draggedMail, setDraggedMail] = useState<Mail | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null);

  const domain = currentTenant?.slug ? `${currentTenant.slug}.com` : 'acme-commerce.com';

  const recentSenders = useMemo(() => {
    const senderMap = new Map<string, { email: string; name: string }>();
    mails.forEach(mail => {
      if (!senderMap.has(mail.sender.email)) {
        senderMap.set(mail.sender.email, { email: mail.sender.email, name: mail.sender.name });
      }
    });
    return Array.from(senderMap.values());
  }, [mails]);

  const filteredMails = useMemo(() => {
    return mails.filter((mail) => {
      const matchesFolder = mail.folder === selectedFolder;
      const matchesAccount = selectedAccount ? mail.accountId === selectedAccount.id : true;
      const matchesSearch = searchQuery
        ? mail.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
          mail.sender.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          mail.bodyPreview.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      return matchesFolder && matchesAccount && matchesSearch;
    });
  }, [mails, selectedFolder, selectedAccount, searchQuery]);

  const folderCounts = useMemo(() => {
    const counts: Record<MailFolder, number> = {
      inbox: 0, sent: 0, drafts: 0, archive: 0, trash: 0, spam: 0,
    };
    mails.forEach((mail) => {
      if (mail.status === 'unread' && mail.folder === 'inbox') counts.inbox++;
      if (mail.folder === 'drafts') counts.drafts++;
    });
    return counts;
  }, [mails]);

  const handleDragStart = useCallback((mail: Mail) => (e: DragEvent) => {
    setDraggedMail(mail);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedMail(null);
    setDragOverTarget(null);
  }, []);

  const handleDragOver = useCallback((folderId: string) => (e: DragEvent) => {
    e.preventDefault();
    setDragOverTarget(folderId);
  }, []);

  const handleDragLeave = useCallback(() => setDragOverTarget(null), []);

  const handleDrop = useCallback((targetFolder: string) => (e: DragEvent) => {
    e.preventDefault();
    if (draggedMail && targetFolder !== draggedMail.folder) {
      setMails(prev => prev.map(m => m.id === draggedMail.id ? { ...m, folder: targetFolder as MailFolder } : m));
      toast({ title: `Email moved to ${targetFolder}` });
    }
    setDraggedMail(null);
    setDragOverTarget(null);
  }, [draggedMail, toast]);

  const handleSelectMail = (mail: Mail) => {
    setSelectedMail(mail);
    if (mail.status === 'unread') {
      setMails(prev => prev.map(m => m.id === mail.id ? { ...m, status: 'read' } : m));
    }
  };

  const handleToggleStar = (mailId: string) => setMails(prev => prev.map(m => m.id === mailId ? { ...m, isStarred: !m.isStarred } : m));
  const handleArchive = (mailId: string) => { setMails(prev => prev.map(m => m.id === mailId ? { ...m, folder: 'archive' } : m)); setSelectedMail(null); toast({ title: 'Email archived' }); };
  const handleDelete = (mailId: string) => { setMails(prev => prev.map(m => m.id === mailId ? { ...m, folder: 'trash' } : m)); setSelectedMail(null); toast({ title: 'Email moved to trash' }); };
  const handleFlag = (mailId: string) => setMails(prev => prev.map(m => m.id === mailId ? { ...m, isFlagged: !m.isFlagged } : m));

  const handleReply = (mail: Mail) => { setComposeMode('reply'); setComposeInitial({ to: mail.sender.email, subject: `Re: ${mail.subject}`, body: `\n\n---\n${mail.body}` }); setIsComposeOpen(true); };
  const handleReplyAll = (mail: Mail) => { setComposeMode('reply'); setComposeInitial({ to: [mail.sender.email, ...mail.recipients.to].join(', '), subject: `Re: ${mail.subject}`, body: `\n\n---\n${mail.body}` }); setIsComposeOpen(true); };
  const handleForward = (mail: Mail) => { setComposeMode('forward'); setComposeInitial({ to: '', subject: `Fwd: ${mail.subject}`, body: `\n\n---\n${mail.body}` }); setIsComposeOpen(true); };
  const handleCompose = () => { setComposeMode('compose'); setComposeInitial({ to: '', subject: '', body: '' }); setIsComposeOpen(true); };

  const handleSendEmail = (email: { to: string; subject: string; body: string }) => {
    const newMail: Mail = { id: `mail-${Date.now()}`, tenantId: currentTenant?.id || 'tenant-1', accountId: selectedAccount?.id || accounts[0].id, sender: { name: 'You', email: selectedAccount?.email || accounts[0].email }, recipients: { to: email.to.split(',').map(e => e.trim()) }, subject: email.subject, body: email.body, bodyPreview: email.body.slice(0, 100), timestamp: new Date().toISOString(), folder: 'sent', status: 'read', isStarred: false, hasAttachments: false };
    setMails(prev => [newMail, ...prev]);
    toast({ title: 'Email sent' });
  };

  const handleCreateAccount = (name: string) => {
    const newAccount: EmailAccount = { id: `acc-${Date.now()}`, tenantId: currentTenant?.id || 'tenant-1', name: name.charAt(0).toUpperCase() + name.slice(1), email: `${name}@${domain}`, type: 'custom', createdAt: new Date().toISOString() };
    setAccounts(prev => [...prev, newAccount]);
    toast({ title: `${newAccount.email} created` });
  };

  const handleAddVip = (email: string, name: string) => { setVipSenders(prev => [...prev, { email, name, addedAt: new Date().toISOString() }]); toast({ title: `${name} added to VIP` }); };
  const handleRemoveVip = (email: string) => { setVipSenders(prev => prev.filter(v => v.email !== email)); toast({ title: 'Removed from VIP' }); };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        <div className="h-14 border-b border-border flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold">Mail</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search mail..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-80 pl-9 h-9" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setIsVipManagerOpen(true)} title="Manage VIPs">
              <Star className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon"><Settings className="h-4 w-4" /></Button>
            <Avatar className="h-8 w-8"><AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" /><AvatarFallback>AM</AvatarFallback></Avatar>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <MailSidebar selectedFolder={selectedFolder} onFolderChange={setSelectedFolder} folderCounts={folderCounts} accounts={accounts} selectedAccount={selectedAccount} onAccountChange={setSelectedAccount} onCompose={handleCompose} onCreateAccount={() => setIsCreateAccountOpen(true)} onEmailSync={() => setIsEmailSyncOpen(true)} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} dragOverTarget={dragOverTarget} vipCount={vipSenders.length} />
          
          <div className="w-80 border-r border-border flex flex-col">
            <div className="p-3 border-b border-border">
              <p className="text-sm font-medium capitalize">{selectedFolder}</p>
              <p className="text-xs text-muted-foreground">{filteredMails.length} message{filteredMails.length !== 1 ? 's' : ''}</p>
            </div>
            <MailList mails={filteredMails} selectedMail={selectedMail} onSelectMail={handleSelectMail} onToggleStar={handleToggleStar} onArchive={handleArchive} onDelete={handleDelete} onFlag={handleFlag} onDragStart={handleDragStart} onDragEnd={handleDragEnd} draggedMail={draggedMail} vipSenders={vipSenders} />
          </div>

          <MailDetail mail={selectedMail} onClose={() => setSelectedMail(null)} onReply={handleReply} onReplyAll={handleReplyAll} onForward={handleForward} onArchive={handleArchive} onDelete={handleDelete} onToggleStar={handleToggleStar} />
        </div>
      </div>

      <ComposeDialog isOpen={isComposeOpen} onClose={() => setIsComposeOpen(false)} onSend={handleSendEmail} initialTo={composeInitial.to} initialSubject={composeInitial.subject} initialBody={composeInitial.body} mode={composeMode} />
      <CreateAccountDialog isOpen={isCreateAccountOpen} onClose={() => setIsCreateAccountOpen(false)} onCreateAccount={handleCreateAccount} domain={domain} />
      <EmailSyncDialog isOpen={isEmailSyncOpen} onClose={() => setIsEmailSyncOpen(false)} onConnect={() => { toast({ title: 'Email synced' }); setIsEmailSyncOpen(false); }} />
      <VipManager isOpen={isVipManagerOpen} onClose={() => setIsVipManagerOpen(false)} vipSenders={vipSenders} onAddVip={handleAddVip} onRemoveVip={handleRemoveVip} recentSenders={recentSenders} />
    </DashboardLayout>
  );
}

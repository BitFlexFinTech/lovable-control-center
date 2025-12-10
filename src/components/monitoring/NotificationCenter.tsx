import { useState } from 'react';
import { 
  Bell, 
  X, 
  Check, 
  CheckCheck, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  XCircle,
  ExternalLink,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useNotifications } from '@/contexts/NotificationContext';
import { cn } from '@/lib/utils';
import { Notification, Alert } from '@/types/monitoring';

export function NotificationCenter() {
  const { 
    notifications, 
    alerts, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    dismissNotification, 
    dismissAlert,
    clearAll 
  } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="h-4 w-4 text-status-warning" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-status-active" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-status-warning" />;
      case 'info':
      default:
        return <Info className="h-4 w-4 text-primary" />;
    }
  };

  const getAlertIcon = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-4 w-4 text-status-inactive" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-status-warning" />;
      case 'info':
      default:
        return <Info className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-primary rounded-full text-[10px] font-medium text-primary-foreground flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="font-semibold">Notifications</h3>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              className="h-7 text-xs"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
            <Button 
              variant="ghost" 
              size="icon-sm" 
              onClick={clearAll}
              className="h-7 w-7"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full rounded-none border-b border-border bg-transparent h-10 p-0">
            <TabsTrigger 
              value="all" 
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              All
            </TabsTrigger>
            <TabsTrigger 
              value="alerts" 
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Alerts
              {alerts.filter(a => !a.read).length > 0 && (
                <Badge variant="destructive" className="ml-1.5 h-5 px-1.5">
                  {alerts.filter(a => !a.read).length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="system" 
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              System
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-80">
            <TabsContent value="all" className="m-0">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={cn(
                        "p-4 hover:bg-muted/50 transition-colors cursor-pointer",
                        !notification.read && "bg-primary/5"
                      )}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={cn(
                              "text-sm",
                              !notification.read && "font-medium"
                            )}>
                              {notification.title}
                            </p>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="h-5 w-5 flex-shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                dismissNotification(notification.id);
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-muted-foreground">
                              {formatTime(notification.timestamp)}
                            </span>
                            {notification.actionUrl && (
                              <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                                {notification.actionLabel || 'View'}
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="alerts" className="m-0">
              {alerts.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No active alerts</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {alerts.map((alert) => (
                    <div 
                      key={alert.id} 
                      className={cn(
                        "p-4 hover:bg-muted/50 transition-colors",
                        !alert.read && "bg-status-warning/5",
                        alert.severity === 'critical' && "bg-status-inactive/5"
                      )}
                      onClick={() => markAsRead(alert.id)}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getAlertIcon(alert.severity)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <p className={cn(
                                "text-sm",
                                !alert.read && "font-medium"
                              )}>
                                {alert.title}
                              </p>
                              <Badge variant={
                                alert.severity === 'critical' ? 'destructive' : 
                                alert.severity === 'warning' ? 'warning' : 'secondary'
                              } className="text-[10px] px-1.5">
                                {alert.severity}
                              </Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="h-5 w-5 flex-shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                dismissAlert(alert.id);
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {alert.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-muted-foreground">
                              {formatTime(alert.timestamp)}
                            </span>
                            {alert.actionLabel && (
                              <Button variant="outline" size="sm" className="h-6 text-xs">
                                {alert.actionLabel}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="system" className="m-0">
              {notifications.filter(n => n.category === 'system').length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No system notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {notifications.filter(n => n.category === 'system').map((notification) => (
                    <div 
                      key={notification.id} 
                      className={cn(
                        "p-4 hover:bg-muted/50 transition-colors",
                        !notification.read && "bg-primary/5"
                      )}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{notification.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {notification.message}
                          </p>
                          <span className="text-xs text-muted-foreground mt-1 block">
                            {formatTime(notification.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}

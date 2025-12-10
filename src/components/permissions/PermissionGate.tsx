import React from 'react';
import { usePermissions, Feature, Action } from '@/hooks/usePermissions';
import { useImpersonation } from '@/contexts/ImpersonationContext';

interface PermissionGateProps {
  feature: Feature;
  action: Action;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  feature,
  action,
  children,
  fallback = null,
}) => {
  const { hasPermission, userRole } = usePermissions();
  const { isImpersonating, impersonatedRole } = useImpersonation();

  // When impersonating, use the impersonated role's permissions
  const effectiveRole = isImpersonating ? impersonatedRole : userRole;
  
  // Super admin always has access unless impersonating
  if (!isImpersonating && userRole === 'super_admin') {
    return <>{children}</>;
  }

  // Check permission based on effective role
  const allowed = hasPermission(feature, action);

  if (!allowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Higher-order component version
export const withPermission = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  feature: Feature,
  action: Action
) => {
  return (props: P) => (
    <PermissionGate feature={feature} action={action}>
      <WrappedComponent {...props} />
    </PermissionGate>
  );
};
import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  GitPullRequest,
  Users,
  UserCheck,
  Receipt,
  CreditCard,
  UserCircle,
  Palette,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiFetchJson } from '../../lib/api';
import { SidebarContainer, NavSectionGroup, NavItem } from '../BaseSidebar';

export default function SuperAdminSidebar({ isOpen, onClose, activeTab, onTabChange }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);

  useEffect(() => {
    let active = true;
    async function fetchPendingCount() {
      try {
        const { ok, data } = await apiFetchJson('/admin/requests?status=Pending');
        if (ok && active && Array.isArray(data?.requests)) {
          const regPending = data.requests.filter(r => r.requestType === 'registration');
          setPendingApprovalsCount(regPending.length);
        }
      } catch {
        // keep 0 on failure
      }
    }
    fetchPendingCount();
    return () => { active = false; };
  }, [location.pathname]);

  // Determine active tab dynamically if not explicitly provided as a prop
  let currentActiveTab = activeTab;
  if (!currentActiveTab) {
    currentActiveTab = 'dashboard';
    if (location.pathname.includes('/super-admin/approvals')) currentActiveTab = 'approvals';
    else if (location.pathname.includes('/super-admin/requests')) currentActiveTab = 'requests';
    else if (location.pathname.includes('/super-admin/users')) currentActiveTab = 'users';
    else if (location.pathname.includes('/super-admin/billing')) currentActiveTab = 'billing';
    else if (location.pathname.includes('/super-admin/payment')) currentActiveTab = 'payment';
    else if (location.pathname.includes('/super-admin/profile')) currentActiveTab = 'profile';
    else if (location.pathname.includes('/super-admin/pos')) currentActiveTab = 'pos';
  }

  const handleNav = (id) => {
    if (onTabChange) {
      onTabChange(id);
    } else {
      if (id === 'dashboard') navigate('/super-admin');
      else navigate(`/super-admin/${id}`);
    }
    if (onClose) onClose();
  };

  return (
    <SidebarContainer isOpen={isOpen} brandName="Nexus Platform" roleTag="Super Admin">
      {/* Overview */}
      <NavSectionGroup title="Overview">
        <NavItem
          icon={LayoutDashboard}
          label="Dashboard"
          active={currentActiveTab === 'dashboard'}
          onClick={() => handleNav('dashboard')}
        />
      </NavSectionGroup>

      {/* User & Shop Management */}
      <NavSectionGroup title="Management">
        <NavItem
          icon={Users}
          label="User Management"
          active={currentActiveTab === 'users'}
          onClick={() => handleNav('users')}
        />
        <NavItem
          icon={UserCheck}
          label="User Approvals"
          active={currentActiveTab === 'approvals'}
          badgeCount={pendingApprovalsCount}
          onClick={() => handleNav('approvals')}
        />
      </NavSectionGroup>

      {/* Finance & Billing */}
      <NavSectionGroup title="Finance">
        <NavItem
          icon={Receipt}
          label="Billing"
          active={currentActiveTab === 'billing'}
          onClick={() => handleNav('billing')}
        />
        <NavItem
          icon={CreditCard}
          label="Payment"
          active={currentActiveTab === 'payment'}
          onClick={() => handleNav('payment')}
        />
        <NavItem
          icon={GitPullRequest}
          label="Requests"
          active={currentActiveTab === 'requests'}
          onClick={() => handleNav('requests')}
        />
      </NavSectionGroup>

      {/* System & Design */}
      <NavSectionGroup title="System">
        <NavItem
          icon={UserCircle}
          label="Settings & Profile"
          active={currentActiveTab === 'profile'}
          onClick={() => handleNav('profile')}
        />
        <NavItem
          icon={Palette}
          label="Theme Management"
          active={currentActiveTab === 'pos'}
          onClick={() => handleNav('pos')}
        />
      </NavSectionGroup>
    </SidebarContainer>
  );
}

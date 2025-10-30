'use client';

import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { DashboardOverview } from '@/components/dashboard-overview';
import { UserManagement } from '@/components/user-management';
import { AcademicStructure } from '@/components/academic-structure';
import { CourseManagement } from '@/components/course-management';
import { useSidebarContext } from '@/contexts/sidebar-context';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  collegeId?: string;
  departmentId?: string;
  programId?: string;
  batchId?: string;
}

type ActiveView = 'dashboard' | 'users' | 'academic' | 'courses';

export function Dashboard({ user }: { user: User }) {
  const { getContextString } = useSidebarContext();
  const [activeView, setActiveView] = React.useState<ActiveView>('dashboard');

  const getNavigationItems = () => {
    const items = [
      { id: 'dashboard', label: 'Dashboard', icon: 'Home' },
    ];

    if (user.role === 'ADMIN' || user.role === 'UNIVERSITY') {
      items.push(
        { id: 'users', label: 'User Management', icon: 'Users' },
        { id: 'academic', label: 'Academic Structure', icon: 'Building' }
      );
    }

    if (user.role === 'TEACHER' || user.role === 'PROGRAM_COORDINATOR') {
      items.push(
        { id: 'courses', label: 'Course Management', icon: 'BookOpen' }
      );
    }

    return items;
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'users':
        return <UserManagement />;
      case 'academic':
        return <AcademicStructure user={user} />;
      case 'courses':
        return <CourseManagement user={user} />;
      default:
        return <DashboardOverview />;
    }
  };

  // For now, we'll render the overview by default
  // In a real app, this would be handled by routing through the existing sidebar
  return (
    <div className="p-6">
      <DashboardOverview />
    </div>
  );
}
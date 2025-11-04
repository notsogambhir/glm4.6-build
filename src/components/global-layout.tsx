'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { useAuth } from '@/hooks/use-auth';
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

interface GlobalLayoutProps {
  user: User;
  children: React.ReactNode;
}

export function GlobalLayout({ user, children }: GlobalLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { logout, updateUserSelections } = useAuth();
  const { selectedProgram, selectedBatch, programs, batches } = useSidebarContext();
  const [activeView, setActiveView] = useState('dashboard');

  // Update active view based on current path
  useEffect(() => {
    const pathToViewMap: Record<string, string> = {
      '/': 'dashboard',
      '/admin': 'admin',
      '/users': 'users',
      '/academic': 'academic',
      '/courses': 'courses',
      '/students': 'students',
      '/teachers': 'teachers',
      '/faculty-management': 'faculty-management',
      '/student-management': 'student-management',
      '/program-outcomes': 'program-outcomes',
      '/reports': 'reports',
      '/obe-compliance': 'obe-compliance',
      '/system-settings': 'system-settings',
    };

    // Find matching view
    const matchedView = Object.entries(pathToViewMap).find(([path]) => 
      pathname === path || pathname.startsWith(path + '/')
    );

    if (matchedView) {
      setActiveView(matchedView[1]);
    }
  }, [pathname]);

  // Get display names for program and batch
  const getProgramName = () => {
    if (!selectedProgram) return '';
    const program = programs.find(p => p.id === selectedProgram);
    return program ? program.name : '';
  };

  const getBatchName = () => {
    if (!selectedBatch) return '';
    const batch = batches.find(b => b.id === selectedBatch);
    return batch ? batch.name : '';
  };

  // Build display string
  const getDisplayString = () => {
    const parts: string[] = [];
    const programName = getProgramName();
    const batchName = getBatchName();
    
    if (programName) parts.push(programName);
    if (batchName) parts.push(batchName);
    
    return parts.join(' - ');
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleBackToSelection = () => {
    // Clear program and batch selections
    if (user) {
      updateUserSelections({ programId: undefined, batchId: undefined });
    }
  };

  const handleViewChange = (view: string) => {
    setActiveView(view);

    // Navigate to the corresponding route
    const viewToPathMap: Record<string, string> = {
      'dashboard': '/',
      'admin': '/admin',
      'users': '/users',
      'academic': '/academic',
      'courses': '/courses',
      'students': '/students',
      'teachers': '/teachers',
      'faculty-management': '/faculty-management',
      'student-management': '/student-management',
      'program-outcomes': '/program-outcomes',
      'reports': '/reports',
      'obe-compliance': '/obe-compliance',
      'system-settings': '/system-settings',
    };

    const targetPath = viewToPathMap[view];
    if (targetPath) {
      router.push(targetPath);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        user={user}
        activeView={activeView}
        onViewChange={handleViewChange}
        onLogout={handleLogout}
        onBackToSelection={handleBackToSelection}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {getDisplayString() || 'Dashboard'}
                </h1>
                <p className="text-sm text-gray-600">
                  Welcome back, {user.name}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {user.role.replace('_', ' ').toLowerCase()}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
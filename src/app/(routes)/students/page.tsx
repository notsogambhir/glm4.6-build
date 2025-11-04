'use client';

import { useAuth } from '@/hooks/use-auth';
import { StudentManagementDepartment } from '@/components/student-management-department';
import { StudentManagementProgramCoordinator } from '@/components/student-management-program-coordinator';
import { StudentManagementTeacher } from '@/components/student-management-teacher';

export default function StudentsPage() {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  // Use different components based on user role
  switch (user.role) {
    case 'ADMIN':
    case 'UNIVERSITY':
      // Admin and University users can view all students across all colleges/departments
      return (
        <div className="p-6">
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Student Management - {user.role.replace('_', ' ')}</h3>
            <p className="text-gray-600">Comprehensive student view and management capabilities.</p>
            <div className="mt-4 text-sm text-gray-500">
              <p>• View all students across institutions</p>
              <p>• Academic performance tracking</p>
              <p>• Enrollment statistics</p>
              <p>• OBE compliance monitoring</p>
            </div>
          </div>
        </div>
      );
    case 'DEPARTMENT':
      return (
        <div className="p-6">
          <StudentManagementDepartment user={user} />
        </div>
      );
    case 'PROGRAM_COORDINATOR':
      return (
        <div className="p-6">
          <StudentManagementProgramCoordinator user={user} />
        </div>
      );
    case 'TEACHER':
      return (
        <div className="p-6">
          <StudentManagementTeacher user={user} />
        </div>
      );
    default:
      return (
        <div className="p-6">
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
            <p className="text-gray-600">Student management is available for authorized personnel only.</p>
          </div>
        </div>
      );
  }
}
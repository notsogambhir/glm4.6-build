'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCheck } from 'lucide-react';

export default function FacultyManagementPage() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <UserCheck className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Faculty Management</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Faculty Management</CardTitle>
          <CardDescription>
            Department-level faculty management and administration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <UserCheck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">Faculty Management Module</p>
            <p className="text-sm">This module is under development and will be available soon.</p>
            <div className="mt-4 text-xs text-gray-400">
              <p>Features coming:</p>
              <ul className="mt-2 space-y-1">
                <li>• Faculty recruitment and onboarding</li>
                <li>• Department faculty assignments</li>
                <li>• Faculty performance reviews</li>
                <li>• Professional development tracking</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
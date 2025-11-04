'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Target } from 'lucide-react';

export default function ProgramOutcomesPage() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Target className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Program Outcomes</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Program Outcomes Management</CardTitle>
          <CardDescription>
            Define and track program educational outcomes (PEOs) and course outcomes (COs)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">Program Outcomes Module</p>
            <p className="text-sm">This module is under development and will be available soon.</p>
            <div className="mt-4 text-xs text-gray-400">
              <p>Features coming:</p>
              <ul className="mt-2 space-y-1">
                <li>• Program Educational Outcomes (PEOs) definition</li>
                <li>• Course Outcomes (COs) management</li>
                <li>• CO-PO mapping matrix</li>
                <li>• Outcome attainment tracking</li>
                <li>• Accreditation support tools</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
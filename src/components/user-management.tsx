'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  collegeId?: string;
  departmentId?: string;
  programId?: string;
}

export function UserManagement() {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }
  const mockUsers = [
    { id: '1', name: 'John Doe', email: 'john@university.edu', role: 'TEACHER', college: 'CUIET', status: 'Active' },
    { id: '2', name: 'Jane Smith', email: 'jane@university.edu', role: 'PROGRAM_COORDINATOR', college: 'CBS', status: 'Active' },
    { id: '3', name: 'Mike Johnson', email: 'mike@university.edu', role: 'DEPARTMENT', college: 'CCP', status: 'Active' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      <Card className="p-3">
        <CardHeader className="px-0 pt-0 pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4" />
            System Users
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="space-y-2">
            {mockUsers.map((mockUser) => (
              <div key={mockUser.id} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium">
                      {mockUser.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-medium">{mockUser.name}</p>
                    <p className="text-xs text-gray-600">{mockUser.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-xs">{mockUser.role.replace('_', ' ')}</Badge>
                  <Badge variant="secondary" className="text-xs">{mockUser.college}</Badge>
                  <Badge className="bg-red-100 text-red-800 text-xs">{mockUser.status}</Badge>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm">
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
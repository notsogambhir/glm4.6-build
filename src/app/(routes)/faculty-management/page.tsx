'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, UserPlus, Search, Loader2, CheckCircle, AlertCircle, Edit } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  departmentId?: string;
  programId?: string;
  batchId?: string;
  department?: {
    name: string;
    code: string;
  };
  program?: {
    name: string;
    code: string;
  };
  batch?: {
    name: string;
  };
}

interface Program {
  id: string;
  name: string;
  code: string;
  departmentId: string;
  description?: string;
  duration?: number;
}

interface Department {
  id: string;
  name: string;
  code: string;
}

export default function FacultyManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchPrograms();
    fetchDepartments();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.filter((user: User) => user.role === 'PROGRAM_COORDINATOR'));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchPrograms = async () => {
    try {
      const response = await fetch('/api/programs');
      if (response.ok) {
        const data = await response.json();
        setPrograms(data);
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments');
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleAssignPrograms = async () => {
    if (!selectedUser || selectedPrograms.length === 0) {
      toast.error('Please select at least one program');
      return;
    }

    setUpdating(true);
    try {
      const response = await fetch('/api/users/assign-programs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          programIds: selectedPrograms,
        }),
      });

      if (response.ok) {
        toast.success('Programs assigned successfully');
        setIsAssignDialogOpen(false);
        setSelectedUser(null);
        setSelectedPrograms([]);
        fetchUsers();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to assign programs');
      }
    } catch (error) {
      console.error('Error assigning programs:', error);
      toast.error('Failed to assign programs');
    } finally {
      setUpdating(false);
    }
  };

  const openAssignDialog = (user: User) => {
    setSelectedUser(user);
    setSelectedPrograms(user.programId ? [user.programId] : []);
    setIsAssignDialogOpen(true);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !selectedDepartment || user.departmentId === selectedDepartment;
    const matchesProgram = !selectedProgram || user.programId === selectedProgram;
    return matchesSearch && matchesDepartment && matchesProgram;
  });

  const availablePrograms = programs.filter(program => 
    !selectedDepartment || program.departmentId === selectedDepartment
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Faculty Management</h1>
          <p className="text-gray-600 mt-2">Manage program coordinators and their program assignments</p>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-red-600" />
          <span className="text-lg font-semibold">{users.length} Program Coordinators</span>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="program">Program</Label>
              <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                <SelectTrigger>
                  <SelectValue placeholder="All Programs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Programs</SelectItem>
                  {programs.map((program) => (
                    <SelectItem key={program.id} value={program.id}>
                      {program.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Program Coordinators List */}
      <Card>
        <CardHeader>
          <CardTitle>Program Coordinators</CardTitle>
          <CardDescription>
            Manage program coordinators and assign them to specific programs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No program coordinators found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {user.role.replace('_', ' ')}
                        </Badge>
                        {user.department && (
                          <Badge variant="secondary" className="text-xs">
                            {user.department.name}
                          </Badge>
                        )}
                        {user.program && (
                          <Badge className="bg-red-100 text-red-800 text-xs">
                            {user.program.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openAssignDialog(user)}
                      className="flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Assign Programs
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assign Programs Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Assign Programs to Coordinator</DialogTitle>
            <DialogDescription>
              Select programs to assign to <strong>{selectedUser?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="programs">Programs</Label>
              <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                {availablePrograms.map((program) => (
                  <div key={program.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={program.id}
                      checked={selectedPrograms.includes(program.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPrograms([...selectedPrograms, program.id]);
                        } else {
                          setSelectedPrograms(selectedPrograms.filter(id => id !== program.id));
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor={program.id} className="text-sm font-medium">
                      {program.name} ({program.code})
                    </Label>
                    <Badge variant="outline" className="text-xs">
                      Dept: {program.departmentId}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
            {selectedPrograms.length === 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please select at least one program to assign.
                </AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssignPrograms}
              disabled={updating || selectedPrograms.length === 0}
            >
              {updating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Assign Programs
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

interface College {
  id: string;
  name: string;
  code: string;
  description?: string;
}

interface Batch {
  id: string;
  name: string;
  startYear: number;
  endYear: number;
}

export function LoginForm() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    collegeId: '',
    batchId: '',
  });
  const [loading, setLoading] = useState(false);
  const [colleges, setColleges] = useState<College[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [showBatchSelection, setShowBatchSelection] = useState(false);

  useEffect(() => {
    fetchColleges();
    fetchBatches();
  }, []);

  const fetchColleges = async () => {
    try {
      const response = await fetch('/api/colleges');
      if (response.ok) {
        const data = await response.json();
        setColleges(data);
      }
    } catch (error) {
      console.error('Failed to fetch colleges:', error);
    }
  };

  const fetchBatches = async () => {
    // Don't fetch batches initially - they require a programId
    // Batches will be fetched when needed (after program selection)
    console.log('Batches will be fetched when program is selected');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password || !formData.collegeId) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await login(formData.email, formData.password, formData.collegeId);
      
      // If batch was selected, store it for after login
      if (formData.batchId) {
        localStorage.setItem('obe-selected-batch', formData.batchId);
      }
      
      toast({
        title: "Success",
        description: "Login successful! Redirecting...",
      });
      
      // Don't reload - let the auth state change naturally redirect the user
      // The AppWrapper will automatically show the dashboard when user state changes
      
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (email: string, password: string, collegeCode?: string) => {
    // Find college ID if college code is provided
    let collegeId = formData.collegeId;
    if (collegeCode) {
      const college = colleges.find(c => c.code === collegeCode);
      if (college) {
        collegeId = college.id;
        setFormData(prev => ({ ...prev, collegeId: college.id }));
      } else {
        // If colleges haven't loaded yet, wait and try again
        if (colleges.length === 0) {
          await fetchColleges();
          const retryCollege = colleges.find(c => c.code === collegeCode);
          if (retryCollege) {
            collegeId = retryCollege.id;
            setFormData(prev => ({ ...prev, collegeId: retryCollege.id }));
          }
        }
      }
    }

    setLoading(true);
    try {
      await login(email, password, collegeId);
      toast({
        title: "Success",
        description: `Logged in as ${email}! Redirecting...`,
      });
      
      // Don't reload - let the auth state change naturally redirect the user
      // The AppWrapper will automatically show the dashboard when user state changes
      
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-2xl font-semibold text-gray-900">
            OBE Portal
          </h2>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Quick Login Buttons */}
            <div className="mb-6 p-4 bg-gray-50 border border-gray-100 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Login</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickLogin('admin@obeportal.com', 'password123')}
                  className="text-xs"
                >
                  Admin
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickLogin('university@obeportal.com', 'password123')}
                  className="text-xs"
                >
                  University
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickLogin('cse@obeportal.com', 'password123', 'CUIET')}
                  className="text-xs"
                >
                  Dept (CSE)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickLogin('business@obeportal.com', 'password123', 'CBS')}
                  className="text-xs"
                >
                  Dept (Biz)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickLogin('pc.beme@obeportal.com', 'password123', 'CUIET')}
                  className="text-xs"
                >
                  PC (BE ME)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickLogin('pc.bba@obeportal.com', 'password123', 'CBS')}
                  className="text-xs"
                >
                  PC (BBA)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickLogin('teacher1@obeportal.com', 'password123', 'CUIET')}
                  className="text-xs"
                >
                  Teacher 1
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickLogin('teacher2@obeportal.com', 'password123', 'CBS')}
                  className="text-xs"
                >
                  Teacher 2
                </Button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="college">College</Label>
                <Select
                  value={formData.collegeId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, collegeId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your college" />
                  </SelectTrigger>
                  <SelectContent>
                    {colleges.map((college) => (
                      <SelectItem key={college.id} value={college.id}>
                        {college.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>

              {/* Batch Selection - Optional for Teachers and Program Coordinators */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="batch">Batch (Optional)</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBatchSelection(!showBatchSelection)}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    {showBatchSelection ? 'Hide' : 'Show'} batch selection
                  </Button>
                </div>
                {showBatchSelection && (
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                    <p className="text-xs text-gray-600 mb-2">
                      Select a batch to set it as your default after login (for Teachers and Program Coordinators)
                    </p>
                    <Select
                      value={formData.batchId}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, batchId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select batch (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {batches.map((batch) => (
                          <SelectItem key={batch.id} value={batch.id}>
                            {batch.name} ({batch.startYear}-{batch.endYear})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
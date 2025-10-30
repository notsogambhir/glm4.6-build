'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

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

interface CourseCreationProps {
  user: User;
  onCourseCreated?: () => void;
}

export function CourseCreation({ user, onCourseCreated }: CourseCreationProps) {
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!courseCode.trim() || !courseName.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!user.programId || !user.batchId) {
      toast.error("Please select a program and batch before creating a course");
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call - replace with actual API endpoint
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: courseCode.toUpperCase(),
          name: courseName.trim(),
          batchId: user.batchId,
          semester: "1st",
        }),
      });

      if (response.ok) {
        toast.success("Course created successfully");
        setCourseCode('');
        setCourseName('');
        onCourseCreated?.();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to create course");
      }
    } catch (error) {
      console.error('Error creating course:', error);
      toast.error("Failed to create course");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <BookOpen className="h-6 w-6 text-red-600" />
        </div>
        <CardTitle className="text-xl font-bold text-gray-900">Create New Course</CardTitle>
        <CardDescription>
          Add a new course to your program
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="courseCode">Course Code</Label>
            <Input
              id="courseCode"
              type="text"
              placeholder="e.g., CS101"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="courseName">Course Name</Label>
            <Input
              id="courseName"
              type="text"
              placeholder="e.g., Introduction to Computer Science"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-center">
            <Button 
              type="submit"
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-2 flex items-center gap-2 transition-colors"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add Course
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
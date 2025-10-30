'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, BookOpen, ChevronDown, ChevronRight, Loader2, CheckCircle, Trash2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { CourseCreation } from '@/components/course-creation';
import { CourseBulkUpload } from '@/components/course-bulk-upload';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

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

interface Course {
  id: string;
  code: string;
  name: string;
  semester: string;
  status: 'FUTURE' | 'ACTIVE' | 'COMPLETED';
  batch: {
    id: string;
    name: string;
    program: {
      name: string;
      code: string;
    };
  };
  _count: {
    courseOutcomes: number;
    assessments: number;
    enrollments: number;
  };
}

interface CourseCategoryProps {
  title: string;
  courses: Course[];
  status: 'FUTURE' | 'ACTIVE' | 'COMPLETED';
  defaultExpanded?: boolean;
  onUpdateStatus: (courseId: string, newStatus: 'FUTURE' | 'ACTIVE' | 'COMPLETED') => void;
  onDeleteCourse: (courseId: string, courseName: string) => void;
  userRole: string;
  updatingCourseId?: string;
  deletingCourseId?: string;
}

function CourseCategory({ title, courses, status, defaultExpanded = false, onUpdateStatus, onDeleteCourse, userRole, updatingCourseId, deletingCourseId }: CourseCategoryProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  const getStatusColor = (courseStatus: string) => {
    switch (courseStatus) {
      case 'FUTURE':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusBadgeColor = (courseStatus: string) => {
    switch (courseStatus) {
      case 'FUTURE':
        return 'bg-gray-50 text-gray-700 border-gray-300';
      case 'ACTIVE':
        return 'bg-green-50 text-green-700 border-green-300';
      case 'COMPLETED':
        return 'bg-blue-50 text-blue-700 border-blue-300';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-300';
    }
  };

  const isUpdating = (courseId: string) => updatingCourseId === courseId;
  const isDeleting = (courseId: string) => deletingCourseId === courseId;

  const canDeleteCourse = (course: Course) => {
    // Only allow deletion of future courses or completed courses with no enrollments
    return course.status === 'FUTURE' || (course.status === 'COMPLETED' && course._count.enrollments === 0);
  };

  const canUpdateStatus = () => {
    // All admin roles can update course status
    return ['DEPARTMENT', 'UNIVERSITY', 'ADMIN'].includes(userRole);
  };

  return (
    <Card className="mb-4 transition-all duration-300">
      <CardHeader 
        className="cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            <BookOpen className="h-5 w-5" />
            {title} ({courses.length})
          </div>
        </CardTitle>
      </CardHeader>
      {isExpanded && (
        <CardContent>
          {courses.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              No {status.toLowerCase()} courses
            </div>
          ) : (
            <div className="space-y-3">
              {courses.map((course) => (
                <div 
                  key={course.id} 
                  className={`flex items-center justify-between p-3 border rounded-lg transition-all duration-300 ${
                    isUpdating(course.id) || isDeleting(course.id)
                      ? 'bg-yellow-50 border-yellow-200' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getStatusColor(course.status)} transition-colors duration-300`}>
                      {isUpdating(course.id) || isDeleting(course.id) ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <BookOpen className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{course.name}</p>
                      <p className="text-xs text-gray-600">{course.code} • {course.semester} Semester</p>
                      <p className="text-xs text-gray-500">{course.batch.program.name} • {course.batch.name}</p>
                      {status === 'ACTIVE' && course._count.enrollments > 0 && (
                        <p className="text-xs text-green-600 font-medium">
                          {course._count.enrollments} students enrolled
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{course._count.enrollments} Students</Badge>
                    <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200 text-xs">{course._count.courseOutcomes} COs</Badge>
                    <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">{course._count.assessments} Assessments</Badge>
                    <Badge className={`text-xs ${getStatusBadgeColor(course.status)}`}>
                      {course.status}
                    </Badge>
                    {canUpdateStatus() && (
                      <Select
                        value={course.status}
                        onValueChange={(value: 'FUTURE' | 'ACTIVE' | 'COMPLETED') => 
                          onUpdateStatus(course.id, value)
                        }
                        disabled={isUpdating(course.id) || isDeleting(course.id)}
                      >
                        <SelectTrigger className="w-32 h-8 text-xs">
                          {isUpdating(course.id) ? (
                            <div className="flex items-center gap-1">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              <span>Updating...</span>
                            </div>
                          ) : (
                            <SelectValue />
                          )}
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FUTURE">Future</SelectItem>
                          <SelectItem value="ACTIVE">Active</SelectItem>
                          <SelectItem value="COMPLETED">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    <Link href={`/courses/${course.id}/manage`}>
                      <Button variant="outline" size="sm" className="hover:bg-red-50 hover:border-red-300" disabled={isUpdating(course.id) || isDeleting(course.id)}>
                        Manage
                      </Button>
                    </Link>
                    {canDeleteCourse(course) && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="hover:bg-red-50 hover:border-red-300 text-red-600 hover:text-red-700"
                            disabled={isUpdating(course.id) || isDeleting(course.id)}
                          >
                            {isDeleting(course.id) ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                              <AlertTriangle className="h-5 w-5 text-red-500" />
                              Delete Course
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete <strong>{course.name}</strong> ({course.code})?
                              <br /><br />
                              This action cannot be undone and will permanently delete:
                              <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>Course information and settings</li>
                                {course._count.courseOutcomes > 0 && <li>{course._count.courseOutcomes} course outcomes</li>}
                                {course._count.assessments > 0 && <li>{course._count.assessments} assessments</li>}
                                {course._count.enrollments > 0 && <li>{course._count.enrollments} student enrollments</li>}
                              </ul>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => onDeleteCourse(course.id, course.name)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete Course
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

export function CourseManagementAdmin({ user }: { user: User }) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingCourseId, setUpdatingCourseId] = useState<string | null>(null);
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      
      const url = `/api/courses`;
      
      console.log('=== FETCHING COURSES FOR ADMIN ===');
      console.log('User:', user);
      console.log('User role:', user.role);
      console.log('Fetching from URL:', url);
      
      const response = await fetch(url, {
        credentials: 'include',
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Courses fetched:', data.length);
        setCourses(data);
      } else {
        console.error('Failed to fetch courses:', response.status);
        // Try without credentials as fallback
        try {
          const fallbackResponse = await fetch(url);
          if (fallbackResponse.ok) {
            const data = await fallbackResponse.json();
            console.log('Courses fetched (fallback):', data.length);
            setCourses(data);
          }
        } catch (fallbackError) {
          console.error('Fallback fetch also failed:', fallbackError);
        }
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      // Try without credentials as fallback
      try {
        const fallbackResponse = await fetch(`/api/courses`);
        if (fallbackResponse.ok) {
          const data = await fallbackResponse.json();
          console.log('Courses fetched (fallback):', data.length);
          setCourses(data);
        }
      } catch (fallbackError) {
        console.error('Fallback fetch also failed:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [refreshKey]);

  const handleCourseCreated = () => {
    setRefreshKey(prev => prev + 1);
    setShowCreateForm(false);
    toast.success('Course created successfully!');
  };

  const handleCoursesUploaded = () => {
    setRefreshKey(prev => prev + 1);
    setShowBulkUpload(false);
    toast.success('Courses uploaded successfully!');
  };

  const handleUpdateStatus = async (courseId: string, newStatus: 'FUTURE' | 'ACTIVE' | 'COMPLETED') => {
    try {
      setUpdatingCourseId(courseId);
      
      const currentCourse = courses.find(c => c.id === courseId);
      const courseName = currentCourse?.name || 'Course';
      
      console.log('=== FRONTEND COURSE STATUS UPDATE (ADMIN) ===');
      console.log('Course ID:', courseId);
      console.log('New Status:', newStatus);
      console.log('Current User:', user);
      console.log('User Role:', user.role);
      
      const url = `/api/courses/${courseId}/status`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-HTTP-Method-Override': 'PATCH',
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });

      const responseText = await response.text();
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        responseData = { message: responseText };
      }

      if (response.ok) {
        if (newStatus === 'ACTIVE') {
          if (responseData.message && responseData.message.includes('automatic enrollment completed')) {
            toast.success(`${courseName} is now active! Automatic enrollment has been processed.`);
          } else {
            const enrolledCount = responseData._count?.enrollments || 0;
            toast.success(`${courseName} is now active! ${enrolledCount > 0 ? `${enrolledCount} students enrolled.` : ''}`);
          }
        } else if (newStatus === 'COMPLETED') {
          toast.success(`${courseName} marked as completed!`);
        } else if (newStatus === 'FUTURE') {
          toast.success(`${courseName} moved to future courses!`);
        }
        
        setRefreshKey(prev => prev + 1);
      } else {
        toast.error(responseData.error || responseData.message || `Failed to update course status: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error updating course status:', error);
      toast.error(`Network error: ${error instanceof Error ? error.message : 'Failed to update course status'}`);
    } finally {
      setUpdatingCourseId(null);
    }
  };

  const handleDeleteCourse = async (courseId: string, courseName: string) => {
    try {
      setDeletingCourseId(courseId);
      
      console.log('=== FRONTEND COURSE DELETION (ADMIN) ===');
      console.log('Course ID:', courseId);
      console.log('Course Name:', courseName);
      console.log('Current User:', user);
      console.log('User Role:', user.role);
      
      const url = `/api/courses/${courseId}`;
      
      const response = await fetch(url, {
        method: 'DELETE',
        credentials: 'include',
      });

      const responseText = await response.text();
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        responseData = { message: responseText };
      }

      if (response.ok) {
        toast.success(`${courseName} has been deleted successfully!`);
        setRefreshKey(prev => prev + 1);
      } else {
        toast.error(responseData.error || responseData.message || `Failed to delete course: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error(`Network error: ${error instanceof Error ? error.message : 'Failed to delete course'}`);
    } finally {
      setDeletingCourseId(null);
    }
  };

  // Group courses by status
  const futureCourses = courses.filter(course => course.status === 'FUTURE');
  const activeCourses = courses.filter(course => course.status === 'ACTIVE');
  const completedCourses = courses.filter(course => course.status === 'COMPLETED');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Course Management - {user.role.replace('_', ' ')}</h1>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => {
              setShowCreateForm(!showCreateForm);
              setShowBulkUpload(false);
            }}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
          >
            <Plus className="h-4 w-4" />
            {showCreateForm ? 'Cancel' : 'Create Course'}
          </Button>
          <Button 
            onClick={() => {
              setShowBulkUpload(!showBulkUpload);
              setShowCreateForm(false);
            }}
            variant="outline"
            className="flex items-center gap-2 border-red-300 text-red-700 hover:bg-red-50"
          >
            <Plus className="h-4 w-4" />
            {showBulkUpload ? 'Cancel' : 'Bulk Upload'}
          </Button>
        </div>
      </div>

      {showCreateForm && (
        <CourseCreation user={user} onCourseCreated={handleCourseCreated} />
      )}

      {showBulkUpload && (
        <CourseBulkUpload 
          user={user} 
          onCoursesUploaded={handleCoursesUploaded}
          onClose={() => setShowBulkUpload(false)}
        />
      )}

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-4">
          <CourseCategory
            title="Active Courses"
            courses={activeCourses}
            status="ACTIVE"
            defaultExpanded={true}
            onUpdateStatus={handleUpdateStatus}
            onDeleteCourse={handleDeleteCourse}
            userRole={user.role}
            updatingCourseId={updatingCourseId || undefined}
            deletingCourseId={deletingCourseId || undefined}
          />
          <CourseCategory
            title="Future Courses"
            courses={futureCourses}
            status="FUTURE"
            defaultExpanded={false}
            onUpdateStatus={handleUpdateStatus}
            onDeleteCourse={handleDeleteCourse}
            userRole={user.role}
            updatingCourseId={updatingCourseId || undefined}
            deletingCourseId={deletingCourseId || undefined}
          />
          <CourseCategory
            title="Completed Courses"
            courses={completedCourses}
            status="COMPLETED"
            defaultExpanded={false}
            onUpdateStatus={handleUpdateStatus}
            onDeleteCourse={handleDeleteCourse}
            userRole={user.role}
            updatingCourseId={updatingCourseId || undefined}
            deletingCourseId={deletingCourseId || undefined}
          />
        </div>
      )}
    </div>
  );
}
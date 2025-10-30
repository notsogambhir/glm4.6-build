'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Trash2, AlertTriangle, Edit } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { CourseEditModal } from '@/components/course-edit-modal';

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

export function CourseManagementAdmin({ user }: { user: User }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/courses');
      
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      } else {
        console.error('Failed to fetch courses');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDeleteCourse = async (courseId: string, courseName: string) => {
    if (!confirm(`Are you sure you want to delete ${courseName}? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingCourseId(courseId);
      
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success(`${courseName} has been deleted successfully!`);
        setCourses(courses.filter(c => c.id !== courseId));
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || `Failed to delete course`);
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error(`Network error: Failed to delete course`);
    } finally {
      setDeletingCourseId(null);
    }
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setIsEditModalOpen(true);
  };

  const handleCourseUpdated = () => {
    fetchCourses(); // Refresh the course list
    setEditingCourse(null);
    setIsEditModalOpen(false);
  };

  const handleCloseEditModal = () => {
    setEditingCourse(null);
    setIsEditModalOpen(false);
  };

  const canDeleteCourse = (course: Course) => {
    return course.status === 'FUTURE' || (course.status === 'COMPLETED' && course._count.enrollments === 0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'FUTURE':
        return 'bg-gray-100 text-gray-800';
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Course Management - {user.role.replace('_', ' ')}</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            All Courses ({courses.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {courses.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
              <p className="text-gray-600">No courses are available in the system.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {courses.map((course) => (
                <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getStatusColor(course.status)}`}>
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{course.name}</h3>
                      <p className="text-sm text-gray-600">{course.code} • {course.semester} Semester</p>
                      <p className="text-xs text-gray-500">{course.batch.program.name} • {course.batch.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{course._count.enrollments} Students</Badge>
                    <Badge variant="secondary">{course._count.courseOutcomes} COs</Badge>
                    <Badge className={getStatusColor(course.status)}>{course.status}</Badge>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="hover:bg-blue-50 hover:border-blue-300 text-blue-600 hover:text-blue-700"
                      onClick={() => handleEditCourse(course)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Link href={`/courses/${course.id}/manage`}>
                      <Button variant="outline" size="sm">Manage</Button>
                    </Link>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className={canDeleteCourse(course) ? "text-red-600 hover:text-red-700 hover:bg-red-50" : "text-gray-400 cursor-not-allowed"}
                      onClick={() => canDeleteCourse(course) && handleDeleteCourse(course.id, course.name)}
                      disabled={deletingCourseId === course.id || !canDeleteCourse(course)}
                      title={canDeleteCourse(course) ? "Delete course" : "Cannot delete: Course is active with enrolled students"}
                    >
                      {deletingCourseId === course.id ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <CourseEditModal
        course={editingCourse}
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onCourseUpdated={handleCourseUpdated}
      />
    </div>
  );
}
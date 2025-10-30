'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Target, 
  BarChart3, 
  Users, 
  FileText,
  Settings,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

// Import tab components
import { OverviewTab } from '@/components/course/tabs/overview-tab';
import { COsTab } from '@/components/course/tabs/cos-tab';
import { AssessmentsTab } from '@/components/course/tabs/assessments-tab';
import { COPOMappingTab } from '@/components/course/tabs/co-po-mapping-tab';
import { COAttainmentsTab } from '@/components/course/tabs/co-attainments-tab';
import { StudentReportsTab } from '@/components/course/tabs/student-reports-tab';

interface Course {
  id: string;
  code: string;
  name: string;
  semester: string;
  students: number;
  assessments: number;
  cos: number;
  programName: string;
  batchName: string;
}

export default function ManageCoursePage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    setLoading(true);
    try {
      // [MOCK DATA] Mock data for now
      const mockCourse: Course = {
        id: courseId,
        code: 'CS101',
        name: 'Introduction to Programming',
        semester: '1st',
        students: 60,
        assessments: 3,
        cos: 5,
        programName: 'BE ME',
        batchName: '2021-2025'
      };
      setCourse(mockCourse);
    } catch (error) {
      console.error('Failed to fetch course:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Course not found</h2>
        <p className="text-gray-600 mt-2">The course you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/courses">
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-gray-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{course.name}</h1>
              <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                <span>{course.code}</span>
                <span>•</span>
                <span>{course.semester} Semester</span>
                <Badge variant="outline" className="text-xs">{course.programName}</Badge>
                <Badge variant="secondary" className="text-xs">{course.batchName}</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-4 w-4 text-blue-600" />
              <div>
                <div className="text-lg font-semibold">{course.students}</div>
                <p className="text-xs text-gray-500">Students</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-lg font-semibold">{course.assessments}</div>
                <p className="text-xs text-gray-500">Assessments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Target className="h-4 w-4 text-purple-600" />
              <div>
                <div className="text-lg font-semibold">{course.cos}</div>
                <p className="text-xs text-gray-500">COs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-4 w-4 text-orange-600" />
              <div>
                <div className="text-lg font-semibold">[85%]</div>
                <p className="text-xs text-gray-500">Attainment</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="cos" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            COs
          </TabsTrigger>
          <TabsTrigger value="assessments" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Assessments
          </TabsTrigger>
          <TabsTrigger value="co-po-mapping" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            CO-PO Mapping
          </TabsTrigger>
          <TabsTrigger value="co-attainments" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            CO Attainments
          </TabsTrigger>
          <TabsTrigger value="student-reports" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Student Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab courseId={courseId} />
        </TabsContent>

        <TabsContent value="cos">
          <COsTab courseId={courseId} />
        </TabsContent>

        <TabsContent value="assessments">
          <AssessmentsTab courseId={courseId} />
        </TabsContent>

        <TabsContent value="co-po-mapping">
          <COPOMappingTab courseId={courseId} />
        </TabsContent>

        <TabsContent value="co-attainments">
          <COAttainmentsTab courseId={courseId} />
        </TabsContent>

        <TabsContent value="student-reports">
          <StudentReportsTab courseId={courseId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
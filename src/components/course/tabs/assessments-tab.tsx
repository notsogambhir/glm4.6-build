'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  FileText, 
  Plus, 
  Edit, 
  Upload, 
  CheckCircle, 
  Clock,
  ExternalLink
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';

interface Assessment {
  id: string;
  name: string;
  type: 'Internal' | 'External';
  totalMarks: number;
  questions: number;
  marksUploaded: boolean;
  createdAt: string;
}

interface AssessmentsTabProps {
  courseId: string;
  courseData?: any;
}

export function AssessmentsTab({ courseId, courseData }: AssessmentsTabProps) {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newAssessment, setNewAssessment] = useState({
    name: '',
    type: 'Internal' as 'Internal' | 'External',
    totalMarks: 100,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (courseData?.assessments) {
      setAssessments(courseData.assessments);
    } else {
      fetchAssessments();
    }
  }, [courseId, courseData]);

  const fetchAssessments = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}`);
      if (response.ok) {
        const courseData = await response.json();
        setAssessments(courseData.assessments || []);
      }
    } catch (error) {
      console.error('Failed to fetch assessments:', error);
    }
  };

  const handleCreateAssessment = async () => {
    if (!newAssessment.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter assessment name",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const assessmentData: Assessment = {
        id: Date.now().toString(),
        name: newAssessment.name.trim(),
        type: newAssessment.type,
        totalMarks: newAssessment.totalMarks,
        questions: 0,
        marksUploaded: false,
        createdAt: new Date().toISOString().split('T')[0],
      };

      // [MOCK API] Add to API
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      
      setAssessments(prev => [...prev, assessmentData]);
      setNewAssessment({ name: '', type: 'Internal', totalMarks: 100 });
      setIsCreateDialogOpen(false);
      toast({
        title: "Success",
        description: "Assessment created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create assessment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'Internal' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <CardTitle>Assessments</CardTitle>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Assessment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Assessment</DialogTitle>
                  <DialogDescription>
                    Create a new assessment
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="assessment-name">Assessment Name</Label>
                    <Input
                      id="assessment-name"
                      placeholder="e.g., Mid Term Examination"
                      value={newAssessment.name}
                      onChange={(e) => setNewAssessment(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="assessment-type">Type</Label>
                    <Select
                      value={newAssessment.type}
                      onValueChange={(value: 'Internal' | 'External') => 
                        setNewAssessment(prev => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Internal">Internal</SelectItem>
                        <SelectItem value="External">External</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="total-marks">Total Marks</Label>
                    <Input
                      id="total-marks"
                      type="number"
                      min="1"
                      max="1000"
                      value={newAssessment.totalMarks}
                      onChange={(e) => setNewAssessment(prev => ({ 
                        ...prev, 
                        totalMarks: parseInt(e.target.value) || 100 
                      }))}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateAssessment} disabled={loading}>
                      {loading ? 'Creating...' : 'Create Assessment'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {assessments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Assessments</h3>
              <p className="text-gray-600 mb-4">
                Create your first assessment to start tracking student performance
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Assessment
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Assessment Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Total Marks</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assessments.map((assessment) => (
                    <TableRow key={assessment.id}>
                      <TableCell className="font-medium">
                        {assessment.name}
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(assessment.type)}>
                          {assessment.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{assessment.totalMarks}</TableCell>
                      <TableCell>{assessment.questions}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {assessment.marksUploaded ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-sm text-green-600">Uploaded</span>
                            </>
                          ) : (
                            <>
                              <Clock className="h-4 w-4 text-orange-600" />
                              <span className="text-sm text-orange-600">Pending</span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Link href={`/courses/${courseId}/assessments/${assessment.id}`}>
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3 mr-1" />
                              Manage
                            </Button>
                          </Link>
                          {!assessment.marksUploaded && (
                            <Button size="sm" variant="outline">
                              <Upload className="h-3 w-3 mr-1" />
                              Upload
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-3">
          <CardHeader className="pb-2 px-0 pt-0">
            <CardTitle className="text-xs font-medium">Total Assessments</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="text-xl font-bold">{assessments.length}</div>
          </CardContent>
        </Card>

        <Card className="p-3">
          <CardHeader className="pb-2 px-0 pt-0">
            <CardTitle className="text-xs font-medium">Internal</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="text-xl font-bold">
              {assessments.filter(a => a.type === 'Internal').length}
            </div>
          </CardContent>
        </Card>

        <Card className="p-3">
          <CardHeader className="pb-2 px-0 pt-0">
            <CardTitle className="text-xs font-medium">External</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="text-xl font-bold">
              {assessments.filter(a => a.type === 'External').length}
            </div>
          </CardContent>
        </Card>

        <Card className="p-3">
          <CardHeader className="pb-2 px-0 pt-0">
            <CardTitle className="text-xs font-medium">Upload Status</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="text-xl font-bold">
              {assessments.filter(a => a.marksUploaded).length}/{assessments.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-4">
        <CardHeader className="px-0 pt-0 pb-3">
          <CardTitle className="text-red-600">[PLACEHOLDER] Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Upload className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Bulk Upload Marks</p>
                  <p className="text-sm text-gray-600">Upload marks from Excel file</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Upload
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <ExternalLink className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Generate Reports</p>
                  <p className="text-sm text-gray-600">Create assessment reports</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Generate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
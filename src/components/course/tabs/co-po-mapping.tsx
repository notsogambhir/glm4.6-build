'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target, Link2, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CourseOutcome {
  id: string;
  code: string;
  description: string;
}

interface ProgramOutcome {
  id: string;
  code: string;
  description: string;
}

interface Mapping {
  coId: string;
  poId: string;
  level: number; // 0-3 scale
}

interface COPOMappingProps {
  courseId: string;
}

export function COPOMapping({ courseId }: COPOMappingProps) {
  const [cos, setCOs] = useState<CourseOutcome[]>([]);
  const [pos, setPOs] = useState<ProgramOutcome[]>([]);
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const mappingLevels = [
    { value: 0, label: 'No Mapping', color: 'bg-gray-100 text-gray-800' },
    { value: 1, label: 'Weak', color: 'bg-yellow-100 text-yellow-800' },
    { value: 2, label: 'Medium', color: 'bg-orange-100 text-orange-800' },
    { value: 3, label: 'Strong', color: 'bg-red-100 text-red-800' },
  ];

  useEffect(() => {
    fetchMappingData();
  }, [courseId]);

  const fetchMappingData = async () => {
    setLoading(true);
    try {
      // Mock data - in real app, this would be API calls
      const mockCOs: CourseOutcome[] = [
        { id: '1', code: 'CO1', description: 'Apply fundamental programming concepts' },
        { id: '2', code: 'CO2', description: 'Design and implement algorithms' },
        { id: '3', code: 'CO3', description: 'Analyze algorithm efficiency' },
        { id: '4', code: 'CO4', description: 'Develop OOP solutions' },
        { id: '5', code: 'CO5', description: 'Evaluate programming paradigms' },
      ];

      const mockPOs: ProgramOutcome[] = [
        { id: '1', code: 'PO1', description: 'Engineering Knowledge' },
        { id: '2', code: 'PO2', description: 'Problem Analysis' },
        { id: '3', code: 'PO3', description: 'Design/Development of Solutions' },
        { id: '4', code: 'PO4', description: 'Conduct Investigations' },
        { id: '5', code: 'PO5', description: 'Modern Tool Usage' },
        { id: '6', code: 'PO6', description: 'Engineer and Society' },
        { id: '7', code: 'PO7', description: 'Environment and Sustainability' },
        { id: '8', code: 'PO8', description: 'Ethics' },
        { id: '9', code: 'PO9', description: 'Individual and Team Work' },
        { id: '10', code: 'PO10', description: 'Communication' },
        { id: '11', code: 'PO11', description: 'Project Management' },
        { id: '12', code: 'PO12', description: 'Life-long Learning' },
      ];

      const mockMappings: Mapping[] = [
        { coId: '1', poId: '1', level: 3 },
        { coId: '1', poId: '2', level: 2 },
        { coId: '1', poId: '3', level: 3 },
        { coId: '2', poId: '1', level: 2 },
        { coId: '2', poId: '2', level: 3 },
        { coId: '2', poId: '3', level: 3 },
        { coId: '3', poId: '2', level: 3 },
        { coId: '3', poId: '4', level: 2 },
        { coId: '4', poId: '1', level: 2 },
        { coId: '4', poId: '3', level: 3 },
        { coId: '5', poId: '2', level: 2 },
        { coId: '5', poId: '4', level: 3 },
      ];

      setCOs(mockCOs);
      setPOs(mockPOs);
      setMappings(mockMappings);
    } catch (error) {
      console.error('Failed to fetch mapping data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMappingLevel = (coId: string, poId: string): number => {
    const mapping = mappings.find(m => m.coId === coId && m.poId === poId);
    return mapping?.level || 0;
  };

  const updateMapping = (coId: string, poId: string, level: number) => {
    setMappings(prev => {
      const existingIndex = prev.findIndex(m => m.coId === coId && m.poId === poId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { coId, poId, level };
        return updated;
      } else {
        return [...prev, { coId, poId, level }];
      }
    });
    setHasChanges(true);
  };

  const handleSaveMappings = async () => {
    setLoading(true);
    try {
      // Mock API call - in real app, this would save to backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setHasChanges(false);
      toast({
        title: "Success",
        description: "CO-PO mappings saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save CO-PO mappings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getMappingStats = () => {
    const totalPossible = cos.length * pos.length;
    const mapped = mappings.filter(m => m.level > 0).length;
    const strong = mappings.filter(m => m.level === 3).length;
    const medium = mappings.filter(m => m.level === 2).length;
    const weak = mappings.filter(m => m.level === 1).length;

    return { totalPossible, mapped, strong, medium, weak };
  };

  const stats = getMappingStats();

  if (loading && cos.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">CO-PO Mapping</h3>
          <p className="text-sm text-gray-600">
            Map Course Outcomes to Program Outcomes and define relationship strength
          </p>
        </div>
        
        <Button
          onClick={handleSaveMappings}
          disabled={loading || !hasChanges}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {loading ? 'Saving...' : 'Save Mappings'}
        </Button>
      </div>

      {/* Mapping Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.totalPossible}</div>
            <p className="text-xs text-gray-600">Total Possible</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.mapped}</div>
            <p className="text-xs text-gray-600">Mapped</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.strong}</div>
            <p className="text-xs text-gray-600">Strong (3)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.medium}</div>
            <p className="text-xs text-gray-600">Medium (2)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.weak}</div>
            <p className="text-xs text-gray-600">Weak (1)</p>
          </CardContent>
        </Card>
      </div>

      {/* Mapping Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            CO-PO Mapping Matrix
          </CardTitle>
          <CardDescription>
            Select mapping strength for each CO-PO pair (0=No Mapping, 1=Weak, 2=Medium, 3=Strong)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">CO / PO</TableHead>
                  {pos.map((po) => (
                    <TableHead key={po.id} className="min-w-24 text-center">
                      <div className="space-y-1">
                        <div className="font-medium">{po.code}</div>
                        <div className="text-xs text-gray-500 hidden lg:block">
                          {po.description.substring(0, 20)}...
                        </div>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {cos.map((co) => (
                  <TableRow key={co.id}>
                    <TableCell className="font-medium">
                      <div className="space-y-1">
                        <div>{co.code}</div>
                        <div className="text-xs text-gray-500 hidden lg:block">
                          {co.description.substring(0, 25)}...
                        </div>
                      </div>
                    </TableCell>
                    {pos.map((po) => {
                      const currentLevel = getMappingLevel(co.id, po.id);
                      const levelConfig = mappingLevels.find(l => l.value === currentLevel);
                      
                      return (
                        <TableCell key={po.id} className="text-center p-2">
                          <Select
                            value={currentLevel.toString()}
                            onValueChange={(value) => updateMapping(co.id, po.id, parseInt(value))}
                          >
                            <SelectTrigger className="w-20">
                              <SelectValue>
                                <Badge className={levelConfig?.color || 'bg-gray-100 text-gray-800'}>
                                  {currentLevel}
                                </Badge>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {mappingLevels.map((level) => (
                                <SelectItem key={level.value} value={level.value.toString()}>
                                  <div className="flex items-center gap-2">
                                    <Badge className={level.color}>
                                      {level.value}
                                    </Badge>
                                    <span className="text-sm">{level.label}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Mapping Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {mappingLevels.map((level) => (
              <div key={level.value} className="flex items-center gap-2">
                <Badge className={level.color}>
                  {level.value}
                </Badge>
                <span className="text-sm">{level.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>NBA Guidelines:</strong> CO-PO mapping is essential for outcome-based education. 
              Strong mappings (3) indicate direct correlation, while weak mappings (1) show indirect relationship. 
              This mapping is used to calculate PO attainment from CO results.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Changes Warning */}
      {hasChanges && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-amber-600" />
            <p className="text-sm text-amber-800">
              <strong>Unsaved Changes:</strong> You have made changes to the CO-PO mapping. Click "Save Mappings" to persist your changes.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
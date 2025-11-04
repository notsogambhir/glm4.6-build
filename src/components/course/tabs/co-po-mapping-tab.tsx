'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Target, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CO {
  id: string;
  code: string;
  description: string;
}

interface PO {
  id: string;
  code: string;
  description: string;
}

interface Mapping {
  coId: string;
  poId: string;
  level: number; // 0-3
}

interface COPOMappingTabProps {
  courseId: string;
  courseData?: any;
}

export function COPOMappingTab({ courseId, courseData }: COPOMappingTabProps) {
  const [cos, setCOs] = useState<CO[]>([]);
  const [pos, setPOs] = useState<PO[]>([]);
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (courseData?.courseOutcomes) {
      setCOs(courseData.courseOutcomes);
      fetchPOsAndMappings();
    } else {
      fetchData();
    }
  }, [courseId, courseData]);

  const fetchPOsAndMappings = async () => {
    try {
      if (!courseData?.batch?.programId) {
        console.warn('No program ID found in course data');
        return;
      }

      // Fetch POs for the course's program
      const posResponse = await fetch(`/api/pos?programId=${courseData.batch.programId}`);
      if (posResponse.ok) {
        const posData = await posResponse.json();
        setPOs(posData);
      }

      // Fetch existing CO-PO mappings for this course
      const mappingsResponse = await fetch(`/api/co-po-mappings?courseId=${courseId}`);
      if (mappingsResponse.ok) {
        const mappingsData = await mappingsResponse.json();
        // Convert mappings data to the expected format
        const formattedMappings = mappingsData.map((mapping: any) => ({
          coId: mapping.coId,
          poId: mapping.poId,
          level: mapping.level
        }));
        setMappings(formattedMappings);
      }
    } catch (error) {
      console.error('Failed to fetch POs and mappings:', error);
    }
  };

  const fetchData = async () => {
    try {
      // [MOCK DATA] Mock COs data
      const mockCOs: CO[] = [
        { id: '1', code: 'CO1', description: 'Understand fundamental programming concepts' },
        { id: '2', code: 'CO2', description: 'Design and implement algorithms' },
        { id: '3', code: 'CO3', description: 'Apply programming skills to solve problems' },
        { id: '4', code: 'CO4', description: 'Analyze and debug code effectively' },
        { id: '5', code: 'CO5', description: 'Work collaboratively on projects' },
      ];

      // [MOCK DATA] Mock POs data
      const mockPOs: PO[] = [
        { id: '1', code: 'PO1', description: 'Engineering Knowledge' },
        { id: '2', code: 'PO2', description: 'Problem Analysis' },
        { id: '3', code: 'PO3', description: 'Design and Development' },
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

      // [MOCK DATA] Mock mappings data
      const mockMappings: Mapping[] = [
        { coId: '1', poId: '1', level: 3 },
        { coId: '1', poId: '2', level: 2 },
        { coId: '2', poId: '2', level: 3 },
        { coId: '2', poId: '3', level: 3 },
        { coId: '3', poId: '3', level: 2 },
        { coId: '3', poId: '5', level: 2 },
        { coId: '4', poId: '2', level: 2 },
        { coId: '4', poId: '5', level: 1 },
        { coId: '5', poId: '9', level: 3 },
        { coId: '5', poId: '10', level: 2 },
      ];

      setCOs(mockCOs);
      setPOs(mockPOs);
      setMappings(mockMappings);
    } catch (error) {
      console.error('Failed to fetch mapping data:', error);
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
        if (level === 0) {
          updated.splice(existingIndex, 1); // Remove mapping if level is 0
        } else {
          updated[existingIndex] = { coId, poId, level };
        }
        return updated;
      } else if (level > 0) {
        return [...prev, { coId, poId, level }];
      }
      return prev;
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Save all mappings to the API
      const savePromises = mappings.map(async (mapping) => {
        const response = await fetch('/api/co-po-mappings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            courseId,
            coId: mapping.coId,
            poId: mapping.poId,
            level: mapping.level
          }),
        });
        
        if (!response.ok) {
          throw new Error(`Failed to save mapping for CO-PO: ${mapping.coId}-${mapping.poId}`);
        }
        
        return response.json();
      });

      await Promise.all(savePromises);
      
      toast({
        title: "Success",
        description: "CO-PO mappings saved successfully",
      });
    } catch (error) {
      console.error('Error saving mappings:', error);
      toast({
        title: "Error",
        description: "Failed to save mappings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 2: return 'bg-orange-100 text-orange-800 border-orange-200';
      case 3: return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLevelLabel = (level: number) => {
    switch (level) {
      case 1: return 'Weak';
      case 2: return 'Medium';
      case 3: return 'Strong';
      default: return 'No Mapping';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              <CardTitle>CO-PO Mapping Matrix</CardTitle>
            </div>
            <Button onClick={handleSave} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Mappings'}
            </Button>
          </div>
          <CardDescription>
            Map Course Outcomes (COs) to Program Outcomes (POs) and define the strength of their relationship
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Legend */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-3">Mapping Levels:</h4>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                <span className="text-sm">0 - No Mapping</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-200 rounded"></div>
                <span className="text-sm">1 - Weak</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-200 rounded"></div>
                <span className="text-sm">2 - Medium</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-200 rounded"></div>
                <span className="text-sm">3 - Strong</span>
              </div>
            </div>
          </div>

          {/* Mapping Matrix */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border border-gray-300 bg-gray-50 p-2 text-left font-medium">
                    CO / PO
                  </th>
                  {pos.map((po) => (
                    <th key={po.id} className="border border-gray-300 bg-gray-50 p-2 text-center min-w-24">
                      <div className="space-y-1">
                        <div className="font-medium">{po.code}</div>
                        <div className="text-xs text-gray-600 max-w-20 truncate" title={po.description}>
                          {po.description}
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cos.map((co) => (
                  <tr key={co.id}>
                    <td className="border border-gray-300 bg-gray-50 p-2">
                      <div className="space-y-1">
                        <div className="font-medium">{co.code}</div>
                        <div className="text-xs text-gray-600 max-w-32 truncate" title={co.description}>
                          {co.description}
                        </div>
                      </div>
                    </td>
                    {pos.map((po) => {
                      const currentLevel = getMappingLevel(co.id, po.id);
                      return (
                        <td key={po.id} className="border border-gray-300 p-2">
                          <Select
                            value={currentLevel.toString()}
                            onValueChange={(value) => updateMapping(co.id, po.id, parseInt(value))}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue>
                                <Badge className={getLevelColor(currentLevel)}>
                                  {getLevelLabel(currentLevel)}
                                </Badge>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">0 - No Mapping</SelectItem>
                              <SelectItem value="1">1 - Weak</SelectItem>
                              <SelectItem value="2">2 - Medium</SelectItem>
                              <SelectItem value="3">3 - Strong</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Mappings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mappings.filter(m => m.level > 0).length}
            </div>
            <p className="text-xs text-gray-600">Active CO-PO mappings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Strong Mappings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mappings.filter(m => m.level === 3).length}
            </div>
            <p className="text-xs text-gray-600">Level 3 mappings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((mappings.filter(m => m.level > 0).length / (cos.length * pos.length)) * 100)}%
            </div>
            <p className="text-xs text-gray-600">Matrix coverage</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg. Strength</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mappings.filter(m => m.level > 0).length > 0 
                ? (mappings.reduce((sum, m) => sum + m.level, 0) / mappings.filter(m => m.level > 0).length).toFixed(1)
                : '0.0'
              }
            </div>
            <p className="text-xs text-gray-600">Average mapping level</p>
          </CardContent>
        </Card>
      </div>

      {/* NBA Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">NBA Guidelines Reference</CardTitle>
          <CardDescription>
            Important guidelines for CO-PO mapping as per NBA requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Mapping Criteria</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Each CO should be mapped to at least 2-3 POs</li>
                <li>• Each PO should have at least 2-3 COs mapped to it</li>
                <li>• Avoid excessive mapping (maintain relevance)</li>
                <li>• Use levels 1-3 to indicate correlation strength</li>
              </ul>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Best Practices</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Ensure balanced distribution across POs</li>
                <li>• Document rationale for strong mappings (level 3)</li>
                <li>• Review mappings periodically with faculty</li>
                <li>• Maintain consistency across courses in the program</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
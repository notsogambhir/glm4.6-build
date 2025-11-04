' use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Target, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { courseEvents } from '@/lib/course-events';

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
  const [programId, setProgramId] = useState<string>('');
  const [isDebugMode, setIsDebugMode] = useState(true);

  useEffect(() => {
    fetchData();
    
    // Listen for CO updates
    const handleCOUpdate = () => {
      fetchData();
    };
    
    courseEvents.on('co-updated', handleCOUpdate);
    
    return () => {
      courseEvents.off('co-updated', handleCOUpdate);
    };
  }, [courseId]);

  const fetchData = async () => {
    try {
      console.log('=== CO-PO MAPPING: Starting data fetch ===');
      console.log('Course ID:', courseId);
      console.log('Course Data:', courseData);
      
      // Fetch COs for this course
      const cosResponse = await fetch(`/api/courses/${courseId}/cos`);
      let cosData: CO[] = [];
      if (cosResponse.ok) {
        cosData = await cosResponse.json();
        console.log('COs fetched:', cosData);
      } else {
        console.error('Failed to fetch COs:', cosResponse.status);
      }
      setCOs(cosData || []);

      // Get program ID from course data or fetch course details
      let programId = courseData?.batch?.programId;
      console.log('Initial program ID from courseData:', programId);
      
      if (!programId) {
        // Fetch course details to get program ID
        console.log('Fetching course details to get program ID...');
        const courseResponse = await fetch(`/api/courses/${courseId}`);
        if (courseResponse.ok) {
          const courseDetails = await courseResponse.json();
          console.log('Course details fetched:', courseDetails);
          programId = courseDetails.batch?.programId;
          console.log('Program ID from course details:', programId);
        } else {
          console.error('Failed to fetch course details:', courseResponse.status);
        }
      }

      if (programId) {
        setProgramId(programId);
        console.log('Fetching POs for program:', programId);
        try {
          // Fetch POs for the course's program
          const posResponse = await fetch(`/api/pos?programId=${programId}`);
          console.log('POs response status:', posResponse.status);
          if (posResponse.ok) {
            const posData = await posResponse.json();
            console.log('POs fetched:', posData);
            setPOs(posData);
          } else {
            console.error('Failed to fetch POs:', posResponse.status);
            const errorText = await posResponse.text();
            console.error('Error response:', errorText);
          }
        } catch (error) {
          console.error('Error fetching POs:', error);
        }

        try {
          // Fetch existing CO-PO mappings for this course
          console.log('Fetching CO-PO mappings for course:', courseId);
          const mappingsResponse = await fetch(`/api/co-po-mappings?courseId=${courseId}`);
          console.log('Mappings response status:', mappingsResponse.status);
          if (mappingsResponse.ok) {
            const mappingsData = await mappingsResponse.json();
            console.log('Mappings fetched:', mappingsData);
            // Convert mappings data to the expected format
            const formattedMappings = mappingsData.map((mapping: any) => ({
              coId: mapping.coId,
              poId: mapping.poId,
              level: mapping.level
            }));
            setMappings(formattedMappings);
          } else {
            console.error('Failed to fetch mappings:', mappingsResponse.status);
            const errorText = await mappingsResponse.text();
            console.error('Error response:', errorText);
          }
        } catch (error) {
          console.error('Error fetching mappings:', error);
        }
      } else {
        console.warn('No program ID found, cannot fetch POs and mappings');
      }
      
      console.log('=== CO-PO MAPPING: Data fetch complete ===');
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
      default: 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLevelLabel = (level: number) => {
    switch (level) {
      case 1: return 'Weak';
      case 2: return 'Medium';
      case 3: return 'Strong';
      default: 'No Mapping';
    }
  };

  return (
    <div className="space-y-6">
      {/* Debug Info */}
      {isDebugMode && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-medium text-yellow-800 mb-2">Debug Info:</h4>
          <div className="text-sm text-yellow-700 space-y-1">
            <p>COs: {cos.length} found</p>
            <p>POs: {pos.length} found</p>
            <p>Mappings: {mappings.length} found</p>
            <p>Course ID: {courseId}</p>
            <p>Program ID: {programId}</p>
          </div>
        </div>
      )}

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
        </div>

          {/* Mapping Matrix */}
          {cos.length === 0 ? (
            <div className="text-center py-12">
              <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Course Outcomes</h3>
              <p className="text-gray-600 mb-4">
                Please add Course Outcomes first before creating CO-PO mappings
              </p>
            </div>
          ) : pos.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Program Outcomes</h3>
              <p className="text-gray-600 mb-4">
                No Program Outcomes found for this course's program
              </p>
            </div>
          ) : (
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
                          </Select>
                        </td>
                      );
                    )}
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
          )}
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
              : '0.0'
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
                <li> Review mappings periodically with faculty</li>
                <li> Maintain consistency across courses in the program</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
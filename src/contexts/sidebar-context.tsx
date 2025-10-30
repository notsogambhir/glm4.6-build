'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface College {
  id: string;
  name: string;
  code: string;
  description?: string;
}

interface Program {
  id: string;
  name: string;
  code: string;
  duration: number;
  description?: string;
}

interface Batch {
  id: string;
  name: string;
  startYear: number;
  endYear: number;
}

interface SidebarContextType {
  // Current selections
  selectedCollege: string | null;
  selectedProgram: string | null;
  selectedBatch: string | null;
  
  // Available data
  colleges: College[];
  programs: Program[];
  batches: Batch[];
  
  // Loading states
  loadingPrograms: boolean;
  loadingBatches: boolean;
  
  // Actions
  setSelectedCollege: (collegeId: string | null) => void;
  setSelectedProgram: (programId: string | null) => void;
  setSelectedBatch: (batchId: string | null) => void;
  
  // Context string for API calls
  getContextString: () => string;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [selectedCollege, setSelectedCollege] = useState<string | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  
  const [colleges, setColleges] = useState<College[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [loadingBatches, setLoadingBatches] = useState(false);

  // Fetch colleges on mount
  useEffect(() => {
    fetchColleges();
  }, []);

  // Fetch programs when college changes
  useEffect(() => {
    if (selectedCollege) {
      fetchPrograms(selectedCollege);
    } else {
      setPrograms([]);
      setSelectedProgram(null);
      setSelectedBatch(null);
    }
  }, [selectedCollege]);

  // Fetch batches when program changes
  useEffect(() => {
    if (selectedProgram) {
      fetchBatches(selectedProgram);
    } else {
      setBatches([]);
      setSelectedBatch(null);
    }
  }, [selectedProgram]);

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

  const fetchPrograms = async (collegeId: string) => {
    setLoadingPrograms(true);
    try {
      const response = await fetch(`/api/programs?collegeId=${collegeId}`);
      if (response.ok) {
        const data = await response.json();
        setPrograms(data);
        setSelectedProgram(null);
        setSelectedBatch(null);
      }
    } catch (error) {
      console.error('Failed to fetch programs:', error);
    } finally {
      setLoadingPrograms(false);
    }
  };

  const fetchBatches = async (programId: string) => {
    setLoadingBatches(true);
    try {
      const response = await fetch(`/api/batches?programId=${programId}`);
      if (response.ok) {
        const data = await response.json();
        setBatches(data);
        // Auto-select newest batch
        if (data.length > 0) {
          setSelectedBatch(data[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch batches:', error);
    } finally {
      setLoadingBatches(false);
    }
  };

  const handleSetSelectedCollege = (collegeId: string | null) => {
    setSelectedCollege(collegeId);
    // Clear dependent selections
    setSelectedProgram(null);
    setSelectedBatch(null);
  };

  const handleSetSelectedProgram = (programId: string | null) => {
    setSelectedProgram(programId);
    // Clear dependent selection
    setSelectedBatch(null);
  };

  const getContextString = () => {
    const params = new URLSearchParams();
    if (selectedCollege) params.append('collegeId', selectedCollege);
    if (selectedProgram) params.append('programId', selectedProgram);
    if (selectedBatch) params.append('batchId', selectedBatch);
    return params.toString();
  };

  return (
    <SidebarContext.Provider
      value={{
        selectedCollege,
        selectedProgram,
        selectedBatch,
        colleges,
        programs,
        batches,
        loadingPrograms,
        loadingBatches,
        setSelectedCollege: handleSetSelectedCollege,
        setSelectedProgram: handleSetSelectedProgram,
        setSelectedBatch,
        getContextString,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebarContext() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebarContext must be used within a SidebarProvider');
  }
  return context;
}
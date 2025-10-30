'use client';

import { AppWrapper } from '@/components/app-wrapper';
import { BatchCourseManagement } from '@/components/batch-course-management';

export default function Home() {
  return (
    <AppWrapper>
      <BatchCourseManagement />
    </AppWrapper>
  );
}
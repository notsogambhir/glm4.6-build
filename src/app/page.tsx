'use client';

import { AppWrapper } from '@/components/app-wrapper';

export default function Home() {
  return (
    <AppWrapper>
      <div className="p-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p>Welcome to the Educational Management System</p>
      </div>
    </AppWrapper>
  );
}
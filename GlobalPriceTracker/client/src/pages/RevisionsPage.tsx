/**
 * Admin Revisions Page
 * 
 * Full-page revision management interface
 */

import React from 'react';
import RevisionManagementDashboard from '@/components/RevisionManagementDashboard';

export function RevisionsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <RevisionManagementDashboard />
      </div>
    </div>
  );
}

export default RevisionsPage;

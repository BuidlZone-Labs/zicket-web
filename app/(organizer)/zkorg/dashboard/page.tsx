import React from 'react';
import DashboardGreeting from '@/app/components/organizer/DashboardGreeting';
import Summary from '@/app/components/organizer/analytics/Summary';
import ActivitiesPanel from '../../../components/organizer/ActivitiesPanel';

export default function OrgBoard() {
  return (
    <div className='min-h-screen bg-transparent'>
      <DashboardGreeting />
      <Summary />
      <ActivitiesPanel />
    </div>
  );
}

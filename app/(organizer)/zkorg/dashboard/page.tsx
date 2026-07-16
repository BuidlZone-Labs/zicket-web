import React from 'react';
import DashboardGreeting from '@/app/components/organizer/DashboardGreeting';
import Summary from '@/app/components/organizer/analytics/Summary';
import AttendanceBreakdownTable from '@/app/components/organizer/analytics/AttendanceBreakdownTable';
import ActivitiesPanel from '../../../components/organizer/ActivitiesPanel';
import ConnectWalletPrompt from '@/app/components/organizer/ConnectWalletPrompt';
import type { AttendanceBreakdownRow } from '@/lib/validations/types';

const mockAttendanceBreakdown: AttendanceBreakdownRow[] = [
  { type: 'wallet-required', count: 111, percentage: 32 },
  { type: 'verified-access', count: 42, percentage: 28 },
  { type: 'anonymous', count: 87, percentage: 40 },
];

export default function OrgBoard() {
  return (
    <div className='min-h-screen bg-transparent'>
      <DashboardGreeting />
      <section className="max-w-300 mx-auto mt-6 mb-4 px-4 lg:px-0">
        <ConnectWalletPrompt />
      </section>
      <Summary />
      <AttendanceBreakdownTable data={mockAttendanceBreakdown} />
      <ActivitiesPanel />
    </div>
  );
}

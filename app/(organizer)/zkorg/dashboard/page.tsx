import React from 'react';
import DashboardGreeting from '@/app/components/organizer/DashboardGreeting';
import Summary from '@/app/components/organizer/analytics/Summary';
import ActivitiesPanel from '../../../components/organizer/ActivitiesPanel';
import ConnectWalletPrompt from '@/app/components/organizer/ConnectWalletPrompt';

export default function OrgBoard() {
  return (
    <div className='min-h-screen bg-transparent'>
      <DashboardGreeting />
      <section className="max-w-300 mx-auto mt-6 mb-4 px-4 lg:px-0">
        <ConnectWalletPrompt />
      </section>
      <Summary />
      <ActivitiesPanel />
    </div>
  );
}

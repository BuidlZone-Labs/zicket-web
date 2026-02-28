import React from 'react';
import ZkEmailCenter from './ZkEmailCenter';
import RecentActivities from './RecentActivities';
import RevenueTrends from './RevenueTrendsChart';
import PrivacySplitChart from './PrivacySplitChart';

const ActivitiesPanel = () => {
  return (
    <section className='flex flex-col px-10 py-10 gap-4 bg-[#F8F8F8]'>

      {/* Row 1: Revenue Trends + Privacy Split */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div className='md:col-span-2'>
          <RevenueTrends />
        </div>
        <div className='md:col-span-1'>
          <PrivacySplitChart />
        </div>
      </div>

      {/* Row 2: ZkEmail Center + Recent Activities */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div className='md:col-span-1'>
          <ZkEmailCenter />
        </div>
        <div className='md:col-span-2'>
          <RecentActivities />
        </div>
      </div>

    </section>
  );
};

export default ActivitiesPanel;
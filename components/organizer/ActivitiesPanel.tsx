import React from 'react';
import ZkEmailCenter from './ZkEmailCenter';
import RecentActivities from './RecentActivities';

const ActivitiesPanel = () => {
  return (
    <section className='grid px-10 py-10 grid-cols-1 md:grid-cols-3 gap-4 bg-[#F8F8F8]'>
      <ZkEmailCenter />
      <RecentActivities />
    </section>
  );
};

export default ActivitiesPanel;

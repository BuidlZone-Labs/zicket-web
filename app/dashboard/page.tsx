import React from 'react';
import ActivitiesPanel from '../components/organizer/ActivitiesPanel';
import { AnalyticsSummary } from '../components/organizer/analytics/AnalyticsSummary';

const page = () => {
  return (
    <div>
      <div className=" p-2 mt-2 shadow-md">
        <AnalyticsSummary />
      </div>
      <ActivitiesPanel />
    </div>
  );
};

export default page;

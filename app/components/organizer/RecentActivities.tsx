import { IRecentActivities } from '@/lib/validations/types';
import Image from 'next/image';
import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Activity from './Activity';

const defaultActivities: IRecentActivities[] = [
  {
    key: 1,
    icon: '/gaurd.svg',
    title: 'New Anonymous RSVP to',
    titleTag: 'DJ Nights Unlisted',
    description: '1 attendee joined anonymously via zkEmail reminder link.',
    timeStamp: 'Just now',
  },
  {
    key: 2,
    icon: '/lock.svg',
    title: 'Privacy Level Updated For',
    titleTag: 'Lagos Crypto Salon',
    description:
      'Event updated to allow verified-only attendance via zkPassport.',
    timeStamp: '8 mins ago',
  },
  {
    key: 3,
    icon: '/coin.svg',
    title: '₦82,000 Revenue Received',
    description:
      '3 paid tickets purchased for Deepwork Retreat using Azguard Wallet.',
    timeStamp: '8 hrs ago',
  },
];

interface RecentActivitiesProps {
  activities?: IRecentActivities[];
  onViewAll?: () => void;
}

const RecentActivities = ({
  activities = defaultActivities,
  onViewAll,
}: RecentActivitiesProps) => {
  return (
    <section className='col-span-2 border border-card-border flex flex-col min-h-[280px] rounded-2xl bg-white'>
      {/* Header */}
      <header className='flex items-center justify-between p-4 border-b border-card-border'>
        <div className='flex items-center gap-3'>
          <Image
            src='/history.svg'
            alt='recent activities'
            width={32}
            height={32}
          />
          <h3 className='font-medium text-dark-gray'>Recent Activities</h3>
        </div>

        <Button
          variant='outline'
          onClick={onViewAll}
          className='rounded-full flex items-center gap-1 px-4 py-2 h-auto text-xs font-medium text-dark-gray border border-[#E5E5E5] hover:bg-[#F8F8F8] transition-colors'
        >
          View All
          <ChevronRight className='w-3.5 h-3.5' />
        </Button>
      </header>

      {/* Activity List */}
      <main className='p-4 h-full flex w-full'>
        {activities.length === 0 ? (
          <p className='text-center my-auto w-full text-sm text-[#9B9B9B]'>
            No activities to show yet...
          </p>
        ) : (
          <div className='flex flex-col w-full gap-3'>
            {activities.map((activity) => (
              <Activity key={activity.key} activity={activity} />
            ))}
          </div>
        )}
      </main>
    </section>
  );
};

export default RecentActivities;
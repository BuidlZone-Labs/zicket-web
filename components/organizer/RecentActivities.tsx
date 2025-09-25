import { IRecentActivities } from '@/lib/types';
import Image from 'next/image';
import React, { ReactNode } from 'react';
import Activity from './Activity';
import { Button } from '../ui/button';
import { ChevronRight } from 'lucide-react';

const recentActivities: IRecentActivities[] = [
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
    title: ' Privacy Level Updated For',
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

const RecentActivities = () => {
  return (
    <section className='col-span-2 border-1 flex flex-col min-h-[280px] border-card-border rounded-2xl bg-white'>
      <header className='flex items-center justify-between p-4 border-b-1 border-card-border'>
        <div className='flex items-center gap-3'>
          <Image
            src='/history.svg'
            alt='secured message'
            width={32}
            height={32}
          />
          <h3 className='font-medium text-dark-gray'>Recent Activities</h3>
        </div>

        <Button
          variant={'outline'}
          className='rounded-full flex items-center gap-2'
        >
          <p className='text-xs font-medium text-dark-gray'>View All</p>
          <ChevronRight />
        </Button>
      </header>

      <main className='p-4 h-full flex w-full'>
        {recentActivities.length === 0 ? (
          <p className='text-center my-auto w-full'>No Data to Show yet...</p>
        ) : (
          <div className='flex flex-col w-full space-y-3'>
            {recentActivities.map((activity) => (
              <Activity key={activity.key} activity={activity} />
            ))}
          </div>
        )}
      </main>
    </section>
  );
};

export default RecentActivities;

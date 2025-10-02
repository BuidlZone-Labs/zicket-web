import Image from 'next/image';
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { EmailActivity } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const activities: EmailActivity[] = [
  {
    key: 1,
    icon: '/message-upload.svg',
    title: '3 messages sent',
  },
  {
    key: 2,
    icon: '/time.svg',
    title: '1 scheduled update',
  },
  {
    key: 3,
    icon: '/notification.svg',
    title: 'Auto-confirmations: ON',
  },
];

const ZkEmailCenter = () => {
  return (
    <section className='col-span-1 border-1 border-card-border rounded-2xl bg-white'>
      <header className='flex items-center justify-between p-4 border-b-1 border-card-border'>
        <div className='flex items-center gap-3'>
          <Image
            src='/ZKEmail.svg'
            alt='secured message'
            width={32}
            height={32}
          />
          <h3 className='font-medium text-dark-gray'>zkEmail Center</h3>
        </div>
        <Select>
          <SelectTrigger className='w-[130px] rounded-full font-medium text-dark-gray'>
            <SelectValue placeholder='This Month' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='30'>This Month</SelectItem>
            <SelectItem value='7'>This Week</SelectItem>
            <SelectItem value='365'>This Year</SelectItem>
          </SelectContent>
        </Select>
      </header>

      <main className='p-4 space-y-6'>
        <div className='p-4 rounded-[8px] min-h-[114.76px] space-y-4 flex flex-col text-dark-gray bg-background-light'>
          <h3 className='text-sm font-medium '>Activities</h3>

          {activities.length === 0 ? (
            <p className='text-center my-auto'>No Data to Show yet...</p>
          ) : (
            <div className='flex flex-col space-y-4'>
              {activities.map((item) => (
                <div key={item.key} className='flex items-center gap-3'>
                  <Image
                    src={item.icon}
                    alt='activity'
                    width={24}
                    height={24}
                  />
                  <p className='text-sm'>{item.title}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <Button
          icon={<ChevronRight />}
          size='lg'
          className='w-full rounded-full py-3 px-6 font-bold text-sm text-primary border-1 border-primary bg-transparent hover:bg-background-light cursor-pointer'
        >
          Send New message
        </Button>
      </main>
    </section>
  );
};

export default ZkEmailCenter;

import { IRecentActivities } from '@/lib/types';
import Image from 'next/image';
import React from 'react';

const Activity = ({ activity }: { activity: IRecentActivities }) => {
  return (
    <div className='rounded-[8px] w-full border-1 border-card-border bg-[#f8f8f8] p-4 flex items-center justify-between gap-3'>
      <div className='flex items-center gap-3'>
        <Image
          src={activity.icon}
          alt='activity image'
          width={40}
          height={40}
        />

        <article>
          <h2 className='font-medium mb-2 text-dark-gray text-xs'>
            {activity.title}

            {activity.titleTag && (
              <span className='bg-white border-1 text-xs font-medium border-card-border rounded-[4px] py-1 px-2 ml-1'>
                {activity.titleTag}
              </span>
            )}
          </h2>
          <p className='text-sm text-text-description-light'>
            {activity.description}
          </p>
        </article>
      </div>

      <p className='font-medium text-sm italic text-text-description-gray'>
        {activity.timeStamp}
      </p>
    </div>
  );
};

export default Activity;

import Image from 'next/image';
import React from 'react';
import { IRecentActivities } from '@/lib/validations/types';

interface ActivityProps {
  activity: IRecentActivities;
}

const Activity = ({ activity }: ActivityProps) => {
  const { icon, title, titleTag, description, timeStamp } = activity;

  return (
    <div className='flex items-start gap-3 p-3 rounded-xl bg-[#F8F8F8] border border-[#EFEFEF]'>
      {/* Icon */}
      <div className='shrink-0 mt-0.5'>
        <Image
          src={icon}
          alt='activity icon'
          width={36}
          height={36}
        />
      </div>

      {/* Content */}
      <div className='flex-1 min-w-0'>
        {/* Title row */}
        <div className='flex flex-wrap items-center gap-1.5'>
          <span className='text-sm font-medium text-[#1A1A1A]'>{title}</span>
          {titleTag && (
            <span className='inline-flex items-center px-2.5 py-0.5 rounded bg-[#EFEFEF] text-xs font-medium text-black whitespace-nowrap'>
              {titleTag}
            </span>
          )}
        </div>

        {/* Description */}
        <p className='mt-1 text-xs text-[#6B6B6B] leading-relaxed'>
          {description}
        </p>
      </div>

      {/* Timestamp */}
      <div className='shrink-0 text-xs text-[#9B9B9B] whitespace-nowrap mt-0.5'>
        · {timeStamp}
      </div>
    </div>
  );
};

export default Activity;
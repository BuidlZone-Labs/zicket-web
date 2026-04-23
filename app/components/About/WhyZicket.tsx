import React from 'react'
import Image from 'next/image'
import Card from './Card'
import Suya from "@/public//images/suya.png"

function WhyZicket() {
  return (
    <div className='lg:flex px-8 md:px-12 lg:px-30 py-6 lg:py-20 gap-20 justify-between xl:gap-36'>
      <div className=' w-full max-w-105 m-auto lg:m-0'>
        <h2 className='text-[32px] xl:text-[40px] font-bold text-[#2C0A4A] dark:text-[#D7B5F5] mb-3'>Why Zicket?</h2>
        <p className='text-[#6C6C6C] font-medium inline-flex' >Zicket is for people-first gatherings. We help hosts and guests connect without compromise, with event access built on Aztec&apos;s privacy stack.</p>
        <div className='flex flex-col w-fit gap-3 mt-10'>
          <Card  title='Private Ticketing on Aztec' content='End-to-end encrypted events. Nobody sees your attendance or wallet history.'/>
          <Card  title='On-chain. Off-noise.' content='Skip the noise. Find events that match your mood, scene, or tribe.'/>
          <Card  title='No Data, Anonymous Access' content='Sign in privately. Join instantly. No profiles or oversharing.'/>
        </div>
      </div>
      <div className='mt-15 lg:mt-0'>
        <Image src={Suya} alt="Suya" className='w-135 h-146 object-cover rounded-xl shadow-lg m-auto lg:m-0' width={540} height={584} />
      </div>
    </div>
  )
}

export default WhyZicket

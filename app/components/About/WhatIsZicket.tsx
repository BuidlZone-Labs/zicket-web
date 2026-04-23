import React from 'react'

function WhatIsZicket() {
  return (
    <div className='lg:flex px-8 md:px-12 lg:px-30 py-6 lg:py-20 gap-20 justify-between xl:gap-36'>
      <div className=''>
        <h2 className='text-[32px] xl:text-[40px] font-bold text-[#2C0A4A] mb-7'>What is Zicket</h2>
      </div>
      <div className='text-[#2C0A4A] font-medium lg:w-[800px] w-full'>
        <p>Zicket is a privacy-first ticketing platform that helps creators, community leaders, and curators host intimate, secure, and invite-only events. Whether it&apos;s a lowkey pop-up, a members-only art show, or a private tech meetup, Zicket ensures that only the right people get in — with zero noise, no public listings, and full control in the hands of the host.</p>
        <br/>
        <p>We&apos;re not trying to make events viral. We&apos;re here to make them meaningful.</p>
        <div className='py-10 border-y border-[#E8E8E8] mt-10'>
          <h3 className='text-2xl font-semibold'>The Mission</h3>
          <p>Our mission is to give communities a safe, minimal, and highly controllable platform to organize events without compromising  their privacy or culture. We believe the best events happen when trust, not reach, is the foundation.</p>
          <br/>
          <p>Zicket exists to protect that trust — by giving creators and attendees a quieter, safer way to gather.</p>
        </div>
      </div>
    </div>
  )
}

export default WhatIsZicket

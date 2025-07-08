import React from 'react'
import HeroSection from '../../components/About/HeroSection'
import WhatIsZicket from '../../components/About/WhatIsZicket'
import WhyZicket from '../../components/About/WhyZicket'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

function page() {
  return (
    <div className="bg-white dark:bg-[#0D0D0D] min-h-screen">
      <HeroSection />
      <WhatIsZicket />
      <WhyZicket />
    </div>
  )
}

export default page
import Banner from '@/common/Banner'
import Header from '@/common/Header'
import SpecialityMenu from '@/common/SpecialityMenu'
import TopDoctors from '@/common/TopDoctors'
import React from 'react'

export default function HomePage() {
  return (
    <div>
      <Header />
      <SpecialityMenu />
      <TopDoctors/>
      <Banner />
    </div>
  )
}

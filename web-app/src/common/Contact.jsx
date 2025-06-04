import React from 'react'
import { assets } from '@/assets/assets'

const Contact = () => {
  return (
    <div className="px-4">
      <div className='text-center text-2xl pt-10 text-gray-500'>
        <p>CONTACT <span className='text-gray-700 font-semibold'>US</span></p>
      </div>

      <div className='my-10 mx-auto max-w-screen-xl flex flex-col md:flex-row justify-between items-center gap-12 mb-28 text-sm'>

        {/* Hình ảnh */}
        <img
          className='w-full md:w-1/2 max-w-[500px] object-cover'
          src={assets.contact_image}
          alt="contact"
        />

        {/* Nội dung */}
        <div className='w-full md:w-1/2 flex flex-col justify-center gap-6 px-2 md:px-8'>
          <p className='font-semibold text-lg text-gray-600'>OUR OFFICE</p>
          <p className='text-gray-500'>
            00000 Willms Station <br />
            Suite 000, Washington, USA
          </p>
          <p className='text-gray-500'>
            Tel: (000) 000-0000 <br />
            Email: greatstackdev@gmail.com
          </p>
          <p className='font-semibold text-lg text-gray-600'>CAREERS AT PRESCRIPTO</p>
          <p className='text-gray-500'>
            Learn more about our teams and job openings.
          </p>
          <button className='border border-black px-8 py-4 text-sm hover:bg-black hover:text-white transition-all duration-500'>
            Explore Jobs
          </button>
        </div>
      </div>
    </div>
  )
}

export default Contact

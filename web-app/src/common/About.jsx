import React from 'react';
import { assets } from '@/assets/assets';

const AboutUs = () => {
  return (
    <div>
      <div className='text-center text-2x1 pt-10 text-gray-500'>
        <p>ABOUT <span className=' text-gray-700 font medium'>US</span></p>
      </div>

      <div className='my-10 flex flex-col md:flex-row gap-12'>
        <img className='w-full md:max-w-[360px]' src={assets.about_image} alt="" />
        <div className='flex flex-col justify-center gap-6 md:w-2/4 text-sm text-gray-600'>
          <p>
            Welcome to Prescripto, your trusted companion in the journey to quit smoking. We understand the physical and emotional challenges that come with nicotine addiction, and we're here to support you every step of the way.
          </p>
          <p>
            Prescripto offers evidence-based tools, expert guidance, and a personalized roadmap to help you break free from tobacco. Whether you're taking your first step or trying again, our platform is designed to empower and encourage your progress.
          </p>
          <b className='text-gray-800'>Our Vision</b>
          <p>
            Our vision at Prescripto is a smoke-free future. We aim to create an accessible and supportive environment for individuals committed to overcoming nicotine dependence, one day at a time.
          </p>
        </div>
      </div>

      <div className='text-xl my-4'>
        <p>WHY <span className='text-gray-700 font-semibold'>CHOOSE US</span> </p>
      </div>

      <div className='flex flex-col md:flex-row mb-20'>
        <div className='border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600  cursor-pointer'>
          <b>SUPPORTIVE PROGRAMS:</b>
          <p>Structured plans tailored to help you quit smoking at your own pace.</p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600  cursor-pointer'>
          <b>EXPERT GUIDANCE:</b>
          <p>Access to healthcare professionals who specialize in smoking cessation.</p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600  cursor-pointer'>
          <b>PERSONALIZED TRACKING:</b>
          <p>Monitor your progress, health improvements, and daily achievements.</p>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;

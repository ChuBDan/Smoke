import { assets } from '@/assets/assets';
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-100 py-10 mt-40">
      <div className="md:mx-10">
        <div className="flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 text-sm">
          {/* Cột trái: Logo và mô tả */}
          <div>
            <img src={assets.logo} alt="" />
            <p>
              Prescripto is your companion in the journey to quit smoking. Our platform offers tools,
              expert support, and daily motivation to help you overcome nicotine addiction and live a healthier, smoke-free life.
            </p>
          </div>

          {/* Cột giữa: COMPANY */}
          <div>
            <p className="text-xl font-medium mb-5">COMPANY</p>
            <ul className="flex flex-col gap-2 text-gray-600">
              <li>Home</li>
              <li>About us</li>
              <li>Contact us</li>
              <li>Privacy policy</li>
            </ul>
          </div>

          {/* Cột phải: GET IN TOUCH */}
          <div>
            <p className="text-xl font-medium mb-5">GET IN TOUCH</p>
            <ul className="flex flex-col gap-2 text-gray-600">
              <li>0964 703 716</li>
              <li>quitsmoking@gmail.com</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="text-center text-gray-500 text-sm mt-10">
        Copyright © 2024 Prescripto - Supporting Your Smoke-Free Journey.
      </div>
    </footer>
  );
};

export default Footer;

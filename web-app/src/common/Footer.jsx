import { assets } from '@/assets/assets';
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-100 py-10 mt-40">
      <div className="md:mx-10">
        <div className="flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 text-sm">
          {/* Cột trái: Logo và văn bản */}
          <div>
            <img src={assets.logo} alt="" />
            <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
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
              <li>+1-212-456-7890</li>
              <li>greatstackdev@gmail.com</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="text-center text-gray-500 text-sm mt-10">
        Copyright © 2024 Prescripto - All Right Reserved.
      </div>
    </footer>
  );
};

export default Footer;
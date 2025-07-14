import React from 'react';
import { assets } from '@/assets/assets';

const Contact = () => {
  return (
    <div className="px-4">
      <div className="text-center text-2xl pt-10 text-gray-500">
        <p>
          CONTACT <span className="text-gray-700 font-semibold">US</span>
        </p>
      </div>

      <div className="my-10 mx-auto max-w-screen-md flex flex-col items-start gap-6 text-sm px-4 sm:px-6 md:px-8 text-gray-600">
        {/* Địa chỉ văn phòng */}
        <div>
          <p className="font-semibold text-lg mb-1">OUR OFFICE</p>
          <p className="text-gray-500">
            00000 Willms Station <br />
            Suite 000, Washington, USA
          </p>
        </div>

        {/* Số điện thoại và email */}
        <div>
          <p className="text-gray-500">
            Tel: 0964 703 716 <br />
            Email: quitsmoking@gmail.com
          </p>
        </div>

        {/* Tuyển dụng */}
        <div>
          <p className="font-semibold text-lg mb-1">CAREERS AT PRESCRIPTO</p>
          <p className="text-gray-500 mb-4">
            Learn more about our teams and job openings.
          </p>
          <button className="border border-black px-6 py-3 text-sm hover:bg-black hover:text-white transition-all duration-300">
            Explore Jobs
          </button>
        </div>
      </div>
    </div>
  );
};

export default Contact;
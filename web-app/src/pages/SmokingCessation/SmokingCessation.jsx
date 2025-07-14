import React from 'react';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import SmokingCessation1 from "@/assets/smokingcessation.png";

const SmokingCessation = () => {
  const navigate = useNavigate();

  const handleTryNow = () => {
    navigate('/membership');
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1
        }
      }
    ]
  };

  return (
    <div className='bg-gradient-to-b from-blue-50 to-white text-gray-800 min-h-screen pt-10 pb-20'>
      <div className='container mx-auto px-4 max-w-7xl'>

        {/* Hero Section */}
        <div className='flex flex-col md:flex-row items-center gap-10 mb-20'>
          <div className='md:w-1/2'>
            <h1 className='text-4xl md:text-5xl font-bold text-blue-800 mb-6 leading-tight'>
              Start your journey to <span className='text-blue-600'>quit smoking</span> today!
            </h1>
            <p className='text-lg text-gray-600 mb-6'>
              A scientific solution to help you quit smoking effectively and sustainably, with support from experts and modern technology.
            </p>
            <button
              onClick={handleTryNow}
              className='bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full shadow-md transition duration-300'
            >
              Try It Now
            </button>
          </div>
          <div className='md:w-1/2'>
            <img
              src={SmokingCessation1}
              alt='Quit Smoking'
              className='w-full rounded-2xl shadow-lg'
            />
          </div>
        </div>

        {/* Features Section */}
        <div className='mb-24'>
          <h2 className='text-3xl font-bold text-center text-gray-800 mb-4'>🔥 Key Features</h2>
          <p className='text-center text-gray-600 mb-10 max-w-2xl mx-auto'>
            Designed by psychological and medical experts, this app offers a comprehensive toolset to support your smoking cessation journey.
          </p>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
            {features.map((feature, index) => (
              <div
                key={index}
                className='bg-white p-6 rounded-xl shadow hover:shadow-lg transition duration-300 border'
              >
                <div className='text-4xl mb-4'>{feature.icon}</div>
                <h3 className='text-xl font-semibold text-blue-700 mb-2'>{feature.title}</h3>
                <p className='text-gray-600 text-sm'>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Section */}
        {/* Pricing Section */}
<div className='mb-24'>
  <h2 className='text-3xl font-bold text-center text-gray-800 mb-8'>💎 Choose Your Plan</h2>
  <div className='flex flex-col md:flex-row gap-8 justify-center items-stretch'>
    
    {/* Free Plan */}
    <div className='bg-white border rounded-2xl p-8 shadow-sm md:w-1/3 max-w-md relative hover:shadow-md transition'>
      <h3 className='text-xl font-semibold text-center text-gray-800 mb-4'>Free Plan</h3>
      <div className='text-3xl font-bold text-center text-blue-500 mb-6'>Free</div>
      <ul className='space-y-3 text-gray-600 mb-8 text-sm'>
        <li>✔ Basic smoking tracking</li>
        <li>✔ View past 7 days progress</li>
        <li>✔ Daily generic quit tips</li>
        <li className='text-gray-400'>✖ No expert support</li>
        <li className='text-gray-400'>✖ Limited badge access</li>
      </ul>
      <button
        onClick={handleTryNow}
        className='w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded transition duration-300'
      >
        Try It Now
      </button>
    </div>

    {/* Standard Plan */}
    <div className='bg-white border border-gray-300 rounded-2xl p-8 shadow-sm md:w-1/3 max-w-md relative hover:shadow-md transition'>
      <h3 className='text-xl font-semibold text-center text-gray-800 mb-4'>Standard Plan</h3>
      <div className='text-3xl font-bold text-center text-blue-500 mb-6'>
        48,000₫<span className='text-base text-gray-500'>/month</span>
      </div>
      <ul className='space-y-3 text-gray-600 mb-8 text-sm'>
        <li>✔ All Free Plan features</li>
        <li>✔ 14-day progress history</li>
        <li>✔ Motivational messages & challenges</li>
        <li>✔ Access to progress charts & graphs</li>
        <li>✔ Unlock up to 10 badges</li>
        <li className='text-gray-400'>✖ No expert consultation</li>
      </ul>
      <button
        onClick={handleTryNow}
        className='w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded transition duration-300'
      >
        Try It Now
      </button>
    </div>

    {/* Premium Plan */}
    <div className='bg-white border-2 border-blue-500 rounded-2xl p-8 shadow-sm md:w-1/3 max-w-md relative hover:shadow-md transition'>
      <div className='absolute top-0 right-6 transform -translate-y-1/2 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full'>
        Most Popular
      </div>
      <h3 className='text-xl font-semibold text-center text-gray-800 mb-4'>Premium Plan</h3>
      <div className='text-3xl font-bold text-center text-blue-500 mb-6'>
        50,000₫<span className='text-base text-gray-500'>/month</span>
      </div>
      <ul className='space-y-3 text-gray-600 mb-8 text-sm'>
        <li>✔ All Standard Plan features</li>
        <li>✔ Unlimited history tracking</li>
        <li>✔ 1-on-1 coaching with expert</li>
        <li>✔ Personalized quit plan & reminders</li>
        <li>✔ Full badge system (20+ types)</li>
        <li>✔ Weekly health reports</li>
        <li>✔ 24/7 community support</li>
      </ul>
      <button
        onClick={handleTryNow}
        className='w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition duration-300'
      >
        Try It Now
      </button>
    </div>
  </div>
</div>


        {/* Testimonials Section */}
        <div className='mb-16'>
          <h2 className='text-3xl font-bold text-center text-gray-800 mb-8'>📣 Success Stories</h2>
          <Slider {...sliderSettings}>
            {testimonials.map((testimonial, index) => (
              <div key={index} className='px-3'>
                <div className='bg-white p-6 rounded-xl shadow-md border h-full'>
                  <p className='italic text-gray-600 mb-4 text-sm'>"{testimonial.quote}"</p>
                  <div className='text-right font-medium text-gray-800'>{testimonial.name}</div>
                </div>
              </div>
            ))}
          </Slider>
        </div>

        {/* Final Call-to-Action */}
        <div className='text-center mt-20'>
          <h3 className='text-xl font-semibold text-gray-700 mb-4'>
            Every second you delay is a missed opportunity for a healthier life.
          </h3>
          <button
            onClick={handleTryNow}
            className='bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-10 rounded-full shadow-lg transition duration-300 text-lg'
          >
            Get Started Now
          </button>
        </div>

      </div>
    </div>
  );
};

// Feature Data
const features = [
  {
    icon: "📱",
    title: "Habit Tracking",
    description: "Record your daily cigarette count and see your reduction trend"
  },
  {
    icon: "📊",
    title: "Progress Stats",
    description: "Visual charts showing your quitting journey"
  },
  {
    icon: "💡",
    title: "Personalized Tips",
    description: "Receive advice tailored to your condition and habits"
  },
  {
    icon: "🏆",
    title: "Reward System",
    description: "Unlock badges as you reach key milestones"
  }
];

// Testimonials
const testimonials = [
  { quote: "I successfully quit after 3 months using this app. Thanks to the team!", name: "Mr. Tuan, 42" },
  { quote: "The badge system motivated me daily. 6 months smoke-free now!", name: "Ms. Huong, 35" },
  { quote: "Thanks to the app, I gradually reduced and finally quit smoking!", name: "Mr. Hoa, 50" },
  { quote: "I had failed many times before, but this time I succeeded thanks to the app.", name: "Ms. Lan, 29" },
  { quote: "The app helped me understand my smoking behavior and overcome urges.", name: "Mr. Binh, 38" },
  { quote: "Seeing my achievements daily was a huge motivation to keep going.", name: "Ms. Thao, 41" }
];

export default SmokingCessation;

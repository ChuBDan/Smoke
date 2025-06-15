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
              Hãy bắt đầu hành trình <span className='text-blue-600'>cai nghiện thuốc lá</span> ngay hôm nay!
            </h1>
            <p className='text-lg text-gray-600 mb-6'>
              Giải pháp khoa học giúp bạn từ bỏ thuốc lá hiệu quả và bền vững, với sự hỗ trợ của chuyên gia và công nghệ hiện đại.
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
          <h2 className='text-3xl font-bold text-center text-gray-800 mb-4'>🔥 Các Tính Năng Nổi Bật</h2>
          <p className='text-center text-gray-600 mb-10 max-w-2xl mx-auto'>
            Được thiết kế bởi các chuyên gia tâm lý và y tế, ứng dụng cung cấp bộ công cụ toàn diện hỗ trợ bạn bỏ thuốc hiệu quả.
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
        <div className='mb-24'>
          <h2 className='text-3xl font-bold text-center text-gray-800 mb-8'>💎 Chọn Gói Phù Hợp Với Bạn</h2>
          <div className='flex flex-col md:flex-row gap-8 justify-center items-stretch'>
            {/* Free Plan */}
            <div className='bg-white border rounded-2xl p-8 shadow-sm md:w-1/3 max-w-md relative hover:shadow-md transition'>
              <h3 className='text-xl font-semibold text-center text-gray-800 mb-4'>Gói Free</h3>
              <div className='text-3xl font-bold text-center text-blue-500 mb-6'>Miễn phí</div>
              <ul className='space-y-3 text-gray-600 mb-8 text-sm'>
                <li>✔ Theo dõi thói quen hút thuốc cơ bản</li>
                <li>✔ Thống kê 7 ngày gần nhất</li>
                <li>✔ 5 lời khuyên mẫu mỗi ngày</li>
                <li className='text-gray-400'>✖ Không có hỗ trợ chuyên gia</li>
                <li className='text-gray-400'>✖ Giới hạn 3 huy hiệu cơ bản</li>
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
                Phổ biến
              </div>
              <h3 className='text-xl font-semibold text-center text-gray-800 mb-4'>Gói Premium</h3>
              <div className='text-3xl font-bold text-center text-blue-500 mb-6'>
                199.000đ<span className='text-base text-gray-500'>/tháng</span>
              </div>
              <ul className='space-y-3 text-gray-600 mb-8 text-sm'>
                <li>✔ Tất cả tính năng gói Free</li>
                <li>✔ Theo dõi không giới hạn thời gian</li>
                <li>✔ Lời khuyên cá nhân hóa hàng ngày</li>
                <li>✔ Hỗ trợ 1:1 với chuyên gia</li>
                <li>✔ Toàn bộ hệ thống huy hiệu (20+ loại)</li>
                <li>✔ Báo cáo chi tiết hàng tuần</li>
                <li>✔ Cộng đồng hỗ trợ 24/7</li>
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

        {/* Testimonials Section (Slider version) */}
        <div className='mb-16'>
          <h2 className='text-3xl font-bold text-center text-gray-800 mb-8'>📣 Câu Chuyện Thành Công</h2>
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

        {/* Closing CTA */}
        <div className='text-center mt-20'>
          <h3 className='text-xl font-semibold text-gray-700 mb-4'>
            Mỗi giây bạn trì hoãn là một cơ hội sống khỏe bị đánh mất.
          </h3>
          <button
            onClick={handleTryNow}
            className='bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-10 rounded-full shadow-lg transition duration-300 text-lg'
          >
            Bắt đầu ngay
          </button>
        </div>

      </div>
    </div>
  );
};

// Dữ liệu tính năng
const features = [
  {
    icon: "📱",
    title: "Theo dõi thói quen",
    description: "Ghi lại số điếu thuốc hút mỗi ngày và xu hướng giảm dần"
  },
  {
    icon: "📊",
    title: "Thống kê tiến độ",
    description: "Biểu đồ trực quan về quá trình cai nghiện của bạn"
  },
  {
    icon: "💡",
    title: "Lời khuyên cá nhân",
    description: "Nhận lời khuyên dựa trên tình trạng và thói quen của bạn"
  },
  {
    icon: "🏆",
    title: "Hệ thống phần thưởng",
    description: "Mở khóa huy hiệu khi đạt mốc quan trọng"
  }
];

// Dữ liệu người dùng (không có hình)
const testimonials = [
  { quote: "Tôi đã bỏ thuốc thành công sau 3 tháng sử dụng ứng dụng. Cảm ơn đội ngũ đã hỗ trợ!", name: "Anh Tuấn, 42 tuổi" },
  { quote: "Hệ thống huy hiệu giúp tôi có động lực mỗi ngày. Đã 6 tháng không hút thuốc!", name: "Chị Hương, 35 tuổi" },
  { quote: "Cảm ơn app đã giúp tôi giảm dần lượng thuốc mỗi ngày và đến nay đã bỏ được!", name: "Anh Hòa, 50 tuổi" },
  { quote: "Tôi từng thất bại nhiều lần, nhưng lần này đã thành công nhờ có app.", name: "Chị Lan, 29 tuổi" },
  { quote: "Ứng dụng giúp tôi hiểu rõ hành vi hút thuốc và vượt qua cám dỗ.", name: "Anh Bình, 38 tuổi" },
  { quote: "Mỗi ngày nhìn vào thành tích là một động lực để tiếp tục.", name: "Chị Thảo, 41 tuổi" }
];

export default SmokingCessation;
  
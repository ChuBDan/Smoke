const MembershipPage = () => {
  return (
    <div className="pb-3 mt-12 font-medium text-zinc-800" style={{ maxWidth: '100%', margin: '0 auto', padding: '60px 20px', minHeight: '100vh' }}>
      <div className="flex flex-col gap-6 items-center">
       

        <div className="membership-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', justifyContent: 'center' }}>
          {/* FREE PLAN */}
          <div className="plan-card" style={{ background: '#fff', color: '#333', borderRadius: '10px', width: '350px', padding: '40px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <h2 className="text-xl font-semibold text-blue-600">Miễn phí</h2>
            <p className="price text-4xl font-bold mt-2">$0 <span style={{ fontSize: '20px' }}>USD</span></p>
            <p className="text-sm mt-2">Cùng khám phá sức mạnh của AI trong các công việc hàng ngày cuộc sống</p>
            <button
              style={{
                backgroundColor: '#d1d5db',
                color: '#333',
                padding: '12px 25px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                marginTop: '20px',
                width: '100%',
              }}
              disabled
            >
              Đã chọn tài khoản
            </button>
            <ul className="mt-4 text-sm">
              <li className="mb-2">✔ Truy cập GPT-4o mini với tính năng suy luận</li>
              <li className="mb-2">✔ Chế độ thoại tiếng chuông</li>
              <li className="mb-2">✔ Dữ liệu được lưu trữ trên web qua tính năng thời kiêm</li>
              <li className="mb-2">✔ Truy cập giới hạn GPT-4o với 0-4 mini</li>
              <li className="mb-2">✔ Hỗ trợ quyên góp với các tính năng thông tin, phần tích dữ liệu nâng cao với toán học</li>
              <li className="mb-2">✔ Sử dụng GPT tư vấn</li>
            </ul>
          </div>

          {/* VIP PLAN */}
          <div className="plan-card" style={{ background: '#fff', color: '#333', borderRadius: '10px', width: '350px', padding: '40px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', position: 'relative' }}>
            <h2 className="text-xl font-semibold text-blue-600 relative">
              VIP
              <span
                style={{
                  position: 'absolute',
                  top: '-15px',
                  right: '-15px',
                  background: '#28a745',
                  color: '#fff',
                  padding: '5px 10px',
                  fontSize: '12px',
                  borderRadius: '5px',
                }}
              >
                PREMIUM
              </span>
            </h2>
            <p className="price text-4xl font-bold mt-2">$200 <span style={{ fontSize: '20px' }}>USD</span></p>
            <p className="text-sm mt-2">Khái thác tối đa OpenAI với cấp độ truy cập cao nhất</p>
            <button
              style={{
                backgroundColor: '#28a745',
                color: '#fff',
                padding: '12px 25px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                marginTop: '20px',
                width: '100%',
              }}
            >
              Chuyển sang VIP
            </button>
            <ul className="mt-4 text-sm">
              <li className="mb-2">✔ Miễn phí nâng trong giới Plus</li>
              <li className="mb-2">✔ Truy cập không giới hạn với tất cả các mức sử dụng với GPT-4o</li>
              <li className="mb-2">✔ Quyên góp cao với chức năng nâng cấp chu chuyn sau, hỗ trợ thêm với 0-4 mini, 0-4-mini-huy với 0-3) và bản xem trước nghiên cứu GPT-4.5 va Operator</li>
              <li className="mb-2">✔ Mở rộng truy cập với chức năng nâng cấp chu chuyn sau với tính năng nghiên cứu bổ sung cho nghiên cứu với phíc tap</li>
              <li className="mb-2">✔ Truy cập với các nghiên cứu nâng cao với nghiên cứu của Codex</li>
              <li className="mb-2">✔ Truy cập với bản xem trước nghiên cứu của Codex</li>
              <li className="mb-2">✔ Quyên góp với các nghiên cứu nâng cao với toán học</li>
              <li className="mb-2">✔ Có hội để thử nghiệm các tính năng mới</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipPage;
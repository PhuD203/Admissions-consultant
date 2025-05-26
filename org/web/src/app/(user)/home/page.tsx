'use client';

// Trong component
import { useRouter } from 'next/navigation';

import React, { useState } from 'react'; // Bắt buộc phải import useState
import data from './data.json';

export default function AboutPage() {
  const router = useRouter();
  const [openId, setOpenId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [openClassId, setOpenClassId] = useState<string | null>(null);
  const [isCourseOpen, setIsCourseOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="bg-gray-50">
      <div className="max-w-4xl mx-auto border-gray-300">
        <div className="container mx-auto p-2 space-y-1">
          <button
            className="sm:hidden fixed top-4 border left-4 z-50 bg-gray-100 text-black p-2 rounded"
            onClick={toggleMenu}
          >
            ☰ Menu
          </button>
          {/* Thanh menu*/}
          <nav
            className={`${
              isOpen ? 'block' : 'hidden'
            }  flex flex-col fixed top-0 gap-5 sm:gap-2 pt-20 h-full w-64 bg-white p-6 z-40 shadow-lg sm:inline-flex sm:fixed  sm:h-8 sm:flex-row sm:static sm:top-0  sm:w-auto  sm:border-2 sm:border-gray-400 sm:rounded-bl-xl sm:rounded-br-xl sm:bg-gray-100 sm:text-gray-800 sm:z-50 sm:shadow-lg sm:p-0 `}
          >
            <a
              href=""
              className="text-gray-600 pl-1 sm:pl-2 pr-1 sm:hover:text-white sm:hover:bg-blue-500 sm:hover:rounded-bl-xl hover:scale-110 hover:text-blue-600 "
            >
              Trang chủ
            </a>
            <a
              href="#"
              className="text-gray-600  pl-1 pr-1 sm:hover:text-white sm:hover:bg-blue-500 hover:scale-110 hover:text-blue-600"
            >
              Giới thiệu
            </a>
            <a
              href="#"
              className="text-gray-600  pl-1  pr-1 sm:hover:text-white sm:hover:bg-blue-500 hover:scale-110 hover:text-blue-600"
            >
              Liên hệ
            </a>
            <a
              href="#"
              className="text-gray-600 pl-1 pr-1 sm:hover:text-white sm:hover:bg-blue-500 hover:scale-110 hover:text-blue-600"
            >
              Đăng ký khóa học
            </a>
            <a
              href="#"
              className="text-gray-600 pl-1 pr-2 sm:hover:text-white sm:hover:bg-blue-500 sm:hover:rounded-br-xl hover:scale-110 hover:text-blue-600"
            >
              Đăng nhập
            </a>
          </nav>
          {/* Phần tiêu đề với ảnh và chữ */}
          <section className="flex items-center gap-10 bg-aqua mb-3 p-6 border border-gray-300 rounded-md max-w-4xl mx-auto justify-between">
            <a href="#">
              <img
                src="https://yu.ctu.edu.vn/images/upload/article/2020/03/0305-logo-ctu.png"
                alt="Ảnh 1"
                className="h-28 object-cover rounded"
              />
            </a>

            <div className="text-center flex flex-col justify-center flex-1 hidden sm:block">
              <p className="text-blue-700 font-semibold text-xl pb-3">
                TRUNG TÂM CÔNG NGHỆ PHẦN MỀM ĐẠI HỌC CẦN THƠ
              </p>
              <p className="text-brown-600 text-lg">TƯ VẤN TUYỂN SINH</p>
            </div>

            <div>
              <img
                src="https://aptechcantho.cusc.vn/DesktopModules/CMSP/HinhDaiDien2/1/20181031cusc.png"
                alt="Ảnh 2"
                className="h-32 object-cover rounded"
              />
            </div>
          </section>

          <section className="overflow-hidden bg-gradient-to-r from-blue-200 via-blue-200 to-blue-200 pt-6 pr-6 pl-6 rounded-t-lg shadow-lg text-black font-semibold leading-relaxed tracking-wide border-gray-200 border-gray-200">
            <div>
              Trung tâm CUSC – Đào tạo CNTT chất lượng cao & tư vấn tuyển sinh
              miễn phí.
              <div>
                Trung tâm hoạt động từ <strong>thứ Hai </strong>đến{' '}
                <strong>thứ Sáu</strong> hàng tuần:
              </div>
              <ul className="list-disc list-inside mt-2 mb-2 space-y-1 pl-8">
                <li>
                  Buổi sáng: từ <strong>7h00</strong> đến <strong>11h00</strong>
                </li>
                <li>
                  Buổi chiều: từ <strong>13h00</strong> đến{' '}
                  <strong>17h00</strong>
                </li>
              </ul>
              <p className="mt-3 text-lg text-blue-900 font-bold pb-5">
                Chọn ngay khóa học mình muốn để được tư vấn tốt nhất!
              </p>
            </div>
          </section>

          {/* Danh sách các mục */}
          <section className="max-w-4xl mx-auto border ">
            <div className="max-w-4xl mx-auto bg-aqua border border-gray-200  shadow-md font-sans">
              {data.map((item, itemIndex) => (
                <div key={itemIndex} className="mb-8">
                  <h2 className="font-extrabold text-2xl pb-3 border-b border-gray-300 px-6 pt-6">
                    {item.title}
                  </h2>

                  {item.course && item.course.length > 0 ? (
                    item.course.map((courseItem, courseIndex) => {
                      const uniqueClassId = `${courseItem.id}-${courseItem.name}`;
                      const isOpen = openId === uniqueClassId;

                      return (
                        <div
                          key={uniqueClassId}
                          className="mb-6 mt-6 ml-8 rounded-md bg-blue-50 p-4 shadow-sm hover:shadow-md transition-shadow duration-300 mr-6"
                        >
                          <p
                            className="flex items-center gap-3 cursor-pointer select-none font-semibold  font-bold text-lg	 text-blue-900 hover:text-red-900 "
                            onClick={() =>
                              setOpenId(isOpen ? null : uniqueClassId)
                            }
                            aria-expanded={isOpen}
                          >
                            <span className="text-xl font-bold"></span>
                            {courseItem.name}
                            <svg
                              className={`w-5 h-5 ml-auto transition-transform duration-300 ${
                                isOpen ? 'rotate-90' : 'rotate-0'
                              }`}
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 5l7 7-7 7"
                              ></path>
                            </svg>
                          </p>

                          {isOpen && (
                            <div className="px-6 mt-3">
                              <ul className="list-disc list-inside list-none  text-gray-700 space-y-2 ">
                                {courseItem.class &&
                                courseItem.class.length > 0 ? (
                                  courseItem.class.map(
                                    (classItem, classIndex) => {
                                      const uniqueClassId = `${itemIndex}-${courseIndex}-${classIndex}`;
                                      const isClassOpen =
                                        openClassId === uniqueClassId;

                                      return (
                                        <li
                                          key={uniqueClassId}
                                          className="border-b border-gray-800 pb-3 pl-4"
                                        >
                                          <div className="flex items-center justify-between">
                                            <span
                                              className="cursor-pointer hover:text-blue-600 font-medium"
                                              onClick={() =>
                                                setOpenClassId(
                                                  isClassOpen
                                                    ? null
                                                    : uniqueClassId
                                                )
                                              }
                                            >
                                              {classItem.name}
                                            </span>

                                            {isClassOpen && (
                                              <button
                                                className="ml-4 bg-blue-600 text-white font-semibold px-4 py-2 rounded hover:bg-blue-700 transition"
                                                aria-label={`Đăng ký tư vấn lớp ${classItem.name}`}
                                                onClick={() => {
                                                  sessionStorage.setItem(
                                                    'fromHome',
                                                    'true'
                                                  );
                                                  localStorage.setItem(
                                                    'formData',
                                                    JSON.stringify({
                                                      className: classItem.name,
                                                      courseName:
                                                        courseItem.name,
                                                      title: item.title,
                                                    })
                                                  );
                                                  router.replace('/form'); // ← Lưu lịch sử
                                                }}
                                              >
                                                Đăng ký tư vấn
                                              </button>
                                            )}
                                          </div>
                                        </li>
                                      );
                                    }
                                  )
                                ) : (
                                  <li className="italic text-gray-500">
                                    Không có thông tin lớp học.
                                  </li>
                                )}
                              </ul>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="px-6 py-4 text-gray-600 italic">
                      Chưa có khóa học nào.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Phần trống có thể thêm nội dung */}
          <section className="max-w-4xl border mx-auto rounded-b-md border-gray-200 bg-gradient-to-r from-blue-200 via-blue-200 to-blue-200">
            <footer className="  mb-3  w-full p-6 flex flex-col sm:flex-row gap-6 sm:space-x-16 text-gray-600 text-sm">
              {/* Phần thông tin liên hệ bên trái */}
              <div className="bg-gray-200 p-4 rounded-md shadow-sm max-w-full sm:max-w-xs flex-shrink-0">
                <p className="font-semibold text-gray-800 mb-2">
                  Trung tâm Công nghệ phần mềm <br /> Đại học Cần Thơ
                </p>
                <p>Địa chỉ: 01 Lý Tự Trọng, Quận Ninh Kiều, TP. Cần Thơ</p>
                <p className="mt-2">Fax: +84 292 373 1071</p>
                <p>
                  Email:{' '}
                  <a href="mailto:cusc@ctu.edu.vn" className="underline">
                    cusc@ctu.edu.vn
                  </a>
                </p>
                <p>Điện thoại: +84 292 383 5581</p>
                <p>Hotline: 0901990665 0911204994</p>
              </div>
              {/* Phần menu bên phải */}
              <div className="flex flex-wrap gap-x-12 gap-y-4 text-gray-400 flex-1 hidden sm:block">
                {/* Tuyển sinh */}
                <div>
                  <h3 className="font-semibold text-gray-400 mb-2">
                    Tuyển sinh
                  </h3>
                  <ul className="space-y-1">
                    <li>• Lịch tuyển sinh</li>
                    <li>• Ghi danh trực tuyến</li>
                    <li>• Câu hỏi thường gặp</li>
                  </ul>
                </div>

                {/* Chương trình đào tạo */}
                <div>
                  <h3 className="font-semibold text-gray-400 mb-2">
                    Chương trình đào tạo
                  </h3>
                  <ul className="space-y-1 max-w-xs">
                    <li>• Lập trình viên quốc tế</li>
                    <li>• Quản trị mạng cao cấp</li>
                    <li>• Quản trị mạng i10</li>
                    <li>• Phát triển ứng dụng Web với JAVA EE</li>
                    <li>• Phát triển ứng dụng Web với ASP.Net MVC</li>
                    <li>• Thiết kế Web chuyên nghiệp</li>
                    <li>• Hacker mũ trắng</li>
                  </ul>
                </div>
              </div>
            </footer>
          </section>
        </div>
      </div>
    </div>
  );
}

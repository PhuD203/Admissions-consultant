// 'use client';

// import * as React from 'react';
// import { AppSidebar } from '@/components/app-sidebar';
// import { SiteHeader } from '@/components/site-header';
// import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

// // Import components
// // Import Component, nhưng cần biết nó chấp nhận props gì để sử dụng data
// import { Component } from '@/components/chart-stacked';
// import { RadarChartGridCircle } from '@/components/radar-chart';
// import { RadialChartStacked } from '@/components/radial-chart';

// // Import hooks
// import {
//   useConsultationsByMonth,
//   useCampaignEffectiveness,
//   useDashboardOverview,
// } from '@/hooks/useChart';

// // Loading skeleton component
// const ChartSkeleton = () => (
//   <div className="animate-pulse">
//     <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
//     <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
//     <div className="h-64 bg-gray-200 rounded"></div>
//   </div>
// );

// // Error component
// const ChartError = ({ message }: { message?: string }) => (
//   <div className="flex items-center justify-center h-64 border border-red-200 rounded-lg bg-red-50">
//     <div className="text-center">
//       <div className="text-red-600 mb-2">⚠️ Lỗi tải dữ liệu</div>
//       <div className="text-sm text-red-500">
//         {message || 'Không thể tải dữ liệu biểu đồ'}
//       </div>
//       <button
//         onClick={() => window.location.reload()}
//         className="mt-2 px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
//       >
//         Thử lại
//       </button>
//     </div>
//   </div>
// );

// export default function Page() {
//   // Get current year for consultations filter
//   const currentYear = new Date().getFullYear();

//   // Fetch consultations data for radar chart
//   const {
//     data: consultationsData,
//     isLoading: consultationsLoading,
//     error: consultationsError,
//     refetch: refetchConsultations,
//   } = useConsultationsByMonth({
//     year: currentYear,
//     // status: 'Completed' // Uncomment if you want to filter by status
//   });

//   // Fetch campaigns data for radial chart
//   const {
//     data: campaignsData,
//     isLoading: campaignsLoading,
//     error: campaignsError,
//     refetch: refetchCampaigns,
//   } = useCampaignEffectiveness({
//     monthsBack: 6, // Get last 6 months data
//   });

//   // Optional: Fetch overview data if needed
//   const {
//     data: overviewData,
//     isLoading: overviewLoading,
//     error: overviewError,
//   } = useDashboardOverview();

//   // Handle refresh for all data
//   const handleRefreshAll = () => {
//     refetchConsultations();
//     refetchCampaigns();
//   };

//   return (
//     <SidebarProvider
//       style={
//         {
//           '--sidebar-width': 'calc(var(--spacing) * 72)',
//           '--header-height': 'calc(var(--spacing) * 12)',
//         } as React.CSSProperties
//       }
//     >
//       <AppSidebar variant="inset" />
//       <SidebarInset>
//         <SiteHeader />
//         <div className="flex flex-1 flex-col">
//           <div className="@container/main flex flex-1 flex-col gap-2">
//             <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
//               {/* Header with refresh button */}
//               <div className="container mx-auto px-4">
//                 <div className="flex justify-between items-center mb-4">
//                   <div>
//                     <h1 className="text-2xl font-bold">Dashboard Analytics</h1>
//                     {overviewData?.lastUpdated && (
//                       <p className="text-sm text-gray-500">
//                         Cập nhật lần cuối:{' '}
//                         {new Date(overviewData.lastUpdated).toLocaleString(
//                           'vi-VN'
//                         )}
//                       </p>
//                     )}
//                   </div>
//                   <button
//                     onClick={handleRefreshAll}
//                     disabled={consultationsLoading || campaignsLoading}
//                     className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     {consultationsLoading || campaignsLoading
//                       ? 'Đang tải...'
//                       : 'Làm mới'}
//                   </button>
//                 </div>
//               </div>

//               <div className="container mx-auto py-8">
//                 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 mx-4">
//                   {/* Radar Chart - Consultations Data */}
//                   <div className="space-y-2">
//                     {consultationsLoading ? (
//                       <ChartSkeleton />
//                     ) : consultationsError ? (
//                       <ChartError message={consultationsError.message} />
//                     ) : (
//                       <RadarChartGridCircle
//                         colorSet="C"
//                         title="Lượt tư vấn theo tuần/tháng"
//                         description="Lưu lượng tư vấn và học viên đăng ký học"
//                         // Pass consultations data to chart
//                         data={consultationsData}
//                       />
//                     )}
//                   </div>

//                   {/* Radial Chart - Campaigns Data */}
//                   <div className="space-y-2 flex flex-col justify-center">
//                     {campaignsLoading ? (
//                       <ChartSkeleton />
//                     ) : campaignsError ? (
//                       <ChartError message={campaignsError.message} />
//                     ) : (
//                       <RadialChartStacked
//                         // Pass campaigns data to chart
//                         data={campaignsData}
//                       />
//                     )}
//                   </div>
//                 </div>

//                 {/* Summary Stats */}
//                 {overviewData && (
//                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mx-4 mt-6">
//                     <div className="bg-white p-4 rounded-lg shadow border">
//                       <div className="text-sm font-medium text-gray-500">
//                         Tổng tư vấn
//                       </div>
//                       <div className="text-2xl font-bold text-blue-600">
//                         {overviewData.consultations.summary.totalConsultations.toLocaleString()}
//                       </div>
//                       <div className="text-xs text-gray-400">
//                         {overviewData.consultations.summary.trendingText}
//                       </div>
//                     </div>

//                     <div className="bg-white p-4 rounded-lg shadow border">
//                       <div className="text-sm font-medium text-gray-500">
//                         Tổng khách truy cập
//                       </div>
//                       <div className="text-2xl font-bold text-green-600">
//                         {overviewData.campaigns.summary.totalVisitors.toLocaleString()}
//                       </div>
//                       <div className="text-xs text-gray-400">
//                         {overviewData.campaigns.summary.trendingText}
//                       </div>
//                     </div>

//                     <div className="bg-white p-4 rounded-lg shadow border">
//                       <div className="text-sm font-medium text-gray-500">
//                         Tỷ lệ chuyển đổi
//                       </div>
//                       <div className="text-2xl font-bold text-purple-600">
//                         {overviewData.campaigns.summary.conversionRate}
//                       </div>
//                       <div className="text-xs text-gray-400">
//                         Trong {overviewData.campaigns.summary.period}
//                       </div>
//                     </div>

//                     <div className="bg-white p-4 rounded-lg shadow border">
//                       <div className="text-sm font-medium text-gray-500">
//                         Thời gian tư vấn TB
//                       </div>
//                       <div className="text-2xl font-bold text-orange-600">
//                         {overviewData.consultations.summary.averageDuration}{' '}
//                         phút
//                       </div>
//                       <div className="text-xs text-gray-400">
//                         Tăng trưởng{' '}
//                         {overviewData.consultations.summary.growthRate}
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               <div className="px-4 lg:px-6">
//                 {/* Truyền dữ liệu và trạng thái loading/error cho Component */}
//                 <Component
//                   data={consultationsData}
//                   isLoading={consultationsLoading}
//                   error={consultationsError}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//       </SidebarInset>
//     </SidebarProvider>
//   );
// }

'use client';

import * as React from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

// import { Component } from '@/components/chart-stacked';
import { RadarChartGridCircle } from '@/components/radar-chart';
import { RadialChartStacked } from '@/components/radial-chart';
import { ConsultationDurationAreaChart } from '@/components/radarchar-time';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CampaignData {
  // gaugeData: {
  //   // value: number; // giá trị gauge (ví dụ: 40%)
  //   // maxValue: number; // giá trị tối đa (ví dụ: 100)
  //   color: string; // màu gauge (ví dụ: "#4f46e5")
  //   status: string; // trạng thái (ví dụ: "Tốt")
  //   title: string; // tiêu đề (ví dụ: "Hiệu suất")
  // };
  summary: {
    totalVisitors: number; // tổng số khách truy cập
    totalRegistered: number; // số đã đăng ký
    totalEngaging: number; // số tương tác
    totalDropout: number; // số bỏ cuộc
    conversionRate: string; // tỷ lệ chuyển đổi ("30%")
    engagementRate: string; // tỷ lệ tương tác ("20%")
    // growthRate: string; // tỷ lệ tăng trưởng ("10%")
    trendingText: string; // xu hướng hiển thị
  };
  // sourceBreakdown: Array<{
  //   source: string; // tên kênh (ví dụ: "Facebook")
  //   totalLeads: number; // tổng số leads từ nguồn đó
  //   engagingCount: number; // số tương tác
  //   registeredCount: number; // số đăng ký
  //   droppedCount: number; // số bỏ cuộc
  //   conversionRate: string; // tỷ lệ chuyển đổi từ nguồn đó
  //   engagementRate: string; // tỷ lệ tương tác từ nguồn đó
  //   avgConversionDays: number; // số ngày chuyển đổi trung bình
  // }>;
  chartData: {
    // month: string;
    phoneCall: number;
    onlineMeeting: number;
    inPerson: number;
    email: number;
    chat: number;
  };
  summaryChart: {
    totalConsultations: number;
    averageDuration: number;
    // growthRate: string;
    // period: string;
    trendingText?: string; // optional nếu không phải lúc nào cũng có
  };
}

interface UserOption {
  id: number;
  full_name: string;
}

type Session = {
  session_date: string;
  duration_minutes: number;
};

export default function Page() {
  const [filters, setFilters] = React.useState<{
    startDate: Date | null;
    endDate: Date | null;
    educationLevel: string;
    users: string;
  }>({
    startDate: null,
    endDate: null,
    educationLevel: '',
    users: '',
  });

  const [userType, setUserType] = React.useState<string | null>(null);
  const [usersOption, setUsersOption] = React.useState<UserOption[]>([]);
  const [hasFetchedUsers, setHasFetchedUsers] = React.useState(false);

  React.useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          console.error('⚠️ Chưa có access token trong localStorage');
          return;
        }

        const user_type_login = localStorage.getItem('cachedUserType');
        if (user_type_login) {
          setUserType(user_type_login);

          if (user_type_login !== 'counselor' && !hasFetchedUsers) {
            const fetchUsers = async () => {
              try {
                const res = await fetch(
                  'http://localhost:3000/api/data/DataUser'
                );
                const json = await res.json();
                setUsersOption([
                  { id: 0, full_name: 'Tất cả' },
                  ...json.data.alluser,
                ]);
              } catch (error) {
                console.error('Lỗi khi fetch users:', error);
              }
            };

            await fetchUsers();
            setHasFetchedUsers(true);
          }
        }

        const query = new URLSearchParams();
        if (filters.startDate)
          query.append('startDate', filters.startDate.toISOString());
        if (filters.endDate)
          query.append('endDate', filters.endDate.toISOString());
        if (filters.educationLevel && filters.educationLevel !== '')
          query.append('educationLevel', filters.educationLevel);
        if (filters.users && filters.users !== '')
          query.append('users', filters.users);

        const res = await fetch(
          `http://localhost:3000/api/Statistical-data?${query.toString()}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${accessToken}`, // 👈 cần dòng này
              'Content-Type': 'application/json',
            },
          }
        );

        const result = await res.json();
        if (result.status === 'success') {
          setDashboardData(result.data.result);
          setSessions(result.data.allSession_time || []);
        } else {
          console.error('Lỗi khi lấy dữ liệu:', result.message);
        }
      } catch (error) {
        console.error('❌ Gọi API thất bại:', error);
      }
    };

    fetchDashboardData();
  }, [
    filters.startDate,
    filters.endDate,
    filters.educationLevel,
    filters.users,
  ]);

  const counselors = [
    { id: 'Scheduled', label: 'Đã lên lịch' },
    { id: 'Completed', label: 'Hoàn thành' },
    { id: 'Canceled', label: 'Đã hủy' },
    { id: 'No_Show', label: 'Không tham dự' },
  ];

  const [dashboardData, setDashboardData] = React.useState<CampaignData | null>(
    null
  );
  const [sessions, setSessions] = React.useState<Session[]>([]);

  // const mockCampaignData: CampaignData = {
  //   // gaugeData: {
  //   //   // value: 0,
  //   //   // maxValue: 100,
  //   //   color: '#4f46e5',
  //   //   status: 'Tốt',
  //   //   title: 'Hiệu suất',
  //   // },
  //   summary: {
  //     totalVisitors: 2000,
  //     totalRegistered: 500,
  //     totalEngaging: 300,
  //     totalDropout: 100,
  //     conversionRate: '30%',
  //     engagementRate: '20%',
  //     // growthRate: '0%',
  //     trendingText: 'Tăng trưởng ổn định so với tháng trước',
  //   },
  //   // sourceBreakdown: [
  //   //   {
  //   //     source: 'Facebook',
  //   //     totalLeads: 800,
  //   //     engagingCount: 200,
  //   //     registeredCount: 120,
  //   //     droppedCount: 40,
  //   //     conversionRate: '15%',
  //   //     engagementRate: '25%',
  //   //     avgConversionDays: 3.2,
  //   //   },
  //   //   {
  //   //     source: 'Google Ads',
  //   //     totalLeads: 500,
  //   //     engagingCount: 150,
  //   //     registeredCount: 100,
  //   //     droppedCount: 20,
  //   //     conversionRate: '20%',
  //   //     engagementRate: '30%',
  //   //     avgConversionDays: 2.5,
  //   //   },
  //   //   {
  //   //     source: 'Zalo',
  //   //     totalLeads: 200,
  //   //     engagingCount: 80,
  //   //     registeredCount: 50,
  //   //     droppedCount: 10,
  //   //     conversionRate: '25%',
  //   //     engagementRate: '40%',
  //   //     avgConversionDays: 1.8,
  //   //   },
  //   // ],
  //   chartData: {
  //     // month: '',
  //     phoneCall: 400,
  //     onlineMeeting: 270,
  //     inPerson: 190,
  //     email: 105,
  //     chat: 155,
  //   },
  //   summaryChart: {
  //     totalConsultations: 1120,
  //     averageDuration: 45,
  //     // growthRate: '+12%',
  //     // period: 'Tổng hợp quý 1',
  //     trendingText: 'Họp online và gọi điện tăng mạnh nhất.',
  //   },
  // };

  const description = React.useMemo(() => {
    const format = (d: Date) => d.toLocaleDateString('vi-VN');

    return filters.startDate && filters.endDate
      ? `Từ ${format(filters.startDate)} đến ${format(filters.endDate)}`
      : filters.startDate
      ? `Từ ${format(filters.startDate)}`
      : filters.endDate
      ? `Đến ${format(filters.endDate)}`
      : '';
  }, [filters.startDate, filters.endDate]);

  // const sessions = Array.from({ length: 100 }, (_, i) => {
  //   const date = new Date(2025, 6, 1 + i); // tháng 7 (index 6), cộng ngày
  //   return {
  //     session_date: date.toISOString().split('T')[0],
  //     duration_minutes: Math.floor(20 + Math.random() * 50), // ngẫu nhiên 20–70 phút
  //   };
  // });

  if (
    !dashboardData ||
    !dashboardData.chartData ||
    !dashboardData.summaryChart
  ) {
    return (
      <div className="text-center p-4 text-gray-500">Đang tải dữ liệu...</div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* Header */}
              <div className="container mx-auto px-4">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h1 className="text-2xl font-bold">Dashboard Analytics</h1>
                    <p className="text-sm text-gray-500">
                      Cập nhật lần cuối: 01/01/2025 00:00:00
                    </p>
                  </div>
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={() => {
                      setFilters({
                        startDate: null,
                        endDate: null,
                        educationLevel: '',
                        users: '',
                      });
                    }}
                  >
                    Đặt lại
                  </button>
                </div>

                {/* Bộ lọc */}
                <div
                  className={`grid grid-cols-1 ${
                    userType !== 'counselor'
                      ? 'md:grid-cols-4'
                      : 'md:grid-cols-3'
                  } gap-4 mt-4`}
                >
                  {/* Trình độ học vấn */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trình độ học vấn
                    </label>
                    <select
                      value={filters.educationLevel}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          educationLevel: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    >
                      <option value="">Tất cả</option>
                      <option value="THPT">THPT</option>
                      <option value="SinhVien">Sinh viên</option>
                      <option value="Other">Khác</option>
                    </select>
                  </div>
                  {/* Ngày bắt đầu */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Từ ngày
                    </label>
                    <input
                      type="date"
                      value={
                        filters.startDate
                          ? filters.startDate.toISOString().split('T')[0]
                          : ''
                      }
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          startDate: e.target.value
                            ? new Date(e.target.value)
                            : null,
                        }))
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                  {/* Ngày kết thúc */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Đến ngày
                    </label>
                    <input
                      type="date"
                      value={
                        filters.endDate
                          ? filters.endDate.toISOString().split('T')[0]
                          : ''
                      }
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          endDate: e.target.value
                            ? new Date(e.target.value)
                            : null,
                        }))
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                  {/* Tư vấn viên*/}
                  {userType !== 'counselor' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tư vấn viên
                      </label>
                      {/* <select
                        value={filters.users}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            users: e.target.value,
                          }))
                        }
                        className="w-full border border-gray-300 rounded px-3 py-2"
                      >
                        <option value="">Tư vấn viên</option>
                        {counselors.map((counselor) => (
                          <option key={counselor.id} value={counselor.id}>
                            {counselor.label}
                          </option>
                        ))}{' '}
                      </select> */}

                      <select
                        value={filters.users}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            users: e.target.value,
                          }))
                        }
                        className="w-full border border-gray-300 rounded px-3 py-2"
                      >
                        {/* <option value="">Tất cả</option> */}
                        {usersOption.map((counselor) => (
                          <option
                            key={counselor.id}
                            value={
                              counselor.id === 0 ? '' : counselor.full_name
                            }
                          >
                            {counselor.full_name}
                          </option>
                        ))}
                      </select>
                      {/* <select
                        value={filters.users}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            users: e.target.value,
                          }))
                        }
                        className="w-full border border-gray-300 rounded px-3 py-2"
                      >
                        <option value="all">Tất cả tư vấn viên</option>
                        {counselors.map((counselor) => (
                          <option
                            key={counselor.id}
                            value={counselor.id.toString()}
                          >
                            {counselor.label}
                          </option>
                        ))}
                      </select> */}
                    </div>
                  )}
                </div>
              </div>

              {/* Charts + Stats */}
              {dashboardData && (
                <div className="container mx-auto py-8">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 mx-4">
                    <div className="space-y-2">
                      <RadarChartGridCircle
                        colorSet="C"
                        title="Thống kê tổng số lượt theo hình thức"
                        description={description}
                        data={{
                          chartData: {
                            chartData: [
                              {
                                // month: dashboardData.chartData.month,
                                phoneCall:
                                  dashboardData.chartData.phoneCall ?? 0,
                                onlineMeeting:
                                  dashboardData.chartData.onlineMeeting,
                                inPerson: dashboardData.chartData.inPerson,
                                email: dashboardData.chartData.email,
                                chat: dashboardData.chartData.chat,
                              },
                            ],
                          },
                          summary: {
                            totalConsultations:
                              dashboardData.summaryChart.totalConsultations,
                            averageDuration:
                              dashboardData.summaryChart.averageDuration,
                            // growthRate: dashboardData.summaryChart.growthRate,
                            // period: dashboardData.summaryChart.period,
                            trendingText:
                              dashboardData.summaryChart.trendingText || 'null',
                          },
                        }}
                      />
                    </div>
                    <div className="space-y-2 flex flex-col justify-center">
                      <RadialChartStacked
                        data={{
                          gaugeData: {
                            // value: dashboardData.gaugeData.value,
                            // maxValue: dashboardData.gaugeData.maxValue,
                            color: '#4f46e5',
                            status: 'Tốt',
                            title: 'Hiệu suất',
                          },
                          summary: {
                            totalVisitors: dashboardData.summary.totalVisitors,
                            totalRegistered:
                              dashboardData.summary.totalRegistered,
                            totalEngaging: dashboardData.summary.totalEngaging,
                            totalDropout: dashboardData.summary.totalDropout,
                            conversionRate:
                              dashboardData.summary.conversionRate,
                            engagementRate:
                              dashboardData.summary.engagementRate,
                            // growthRate: dashboardData.summary.growthRate,
                            period:
                              filters.startDate && filters.endDate
                                ? `Từ ${filters.startDate.toLocaleDateString(
                                    'vi-VN'
                                  )} đến ${filters.endDate.toLocaleDateString(
                                    'vi-VN'
                                  )}`
                                : filters.startDate
                                ? `Từ ${filters.startDate.toLocaleDateString(
                                    'vi-VN'
                                  )}`
                                : filters.endDate
                                ? `Đến ${filters.endDate.toLocaleDateString(
                                    'vi-VN'
                                  )}`
                                : '',
                            trendingText: dashboardData.summary.trendingText,
                          },
                          // sourceBreakdown: [], // có thể bỏ qua hoặc để rỗng nếu không dùng
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mx-4 mt-6">
                    <div className="bg-white p-4 rounded-lg shadow border">
                      <div className="text-sm font-medium text-gray-500">
                        Tổng khách truy cập
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {dashboardData.summary.totalVisitors}
                      </div>
                      <div className="text-xs text-gray-400">
                        {filters.startDate && filters.endDate
                          ? `Từ ${filters.startDate.toLocaleDateString(
                              'vi-VN'
                            )} đến ${filters.endDate.toLocaleDateString(
                              'vi-VN'
                            )}`
                          : filters.startDate
                          ? `Từ ${filters.startDate.toLocaleDateString(
                              'vi-VN'
                            )}`
                          : filters.endDate
                          ? `Đến ${filters.endDate.toLocaleDateString('vi-VN')}`
                          : 'Không giới hạn thời gian	'}
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow border">
                      <div className="text-sm font-medium text-gray-500">
                        Tổng tư vấn :
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        {dashboardData.summary.totalDropout +
                          dashboardData.summary.totalEngaging +
                          dashboardData.summary.totalRegistered}
                      </div>
                      <div className="text-xs text-gray-400">
                        {filters.startDate && filters.endDate
                          ? `Từ ${filters.startDate.toLocaleDateString(
                              'vi-VN'
                            )} đến ${filters.endDate.toLocaleDateString(
                              'vi-VN'
                            )}`
                          : filters.startDate
                          ? `Từ ${filters.startDate.toLocaleDateString(
                              'vi-VN'
                            )}`
                          : filters.endDate
                          ? `Đến ${filters.endDate.toLocaleDateString('vi-VN')}`
                          : 'Không giới hạn thời gian	'}{' '}
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow border">
                      <div className="text-sm font-medium text-gray-500">
                        Tỷ lệ chuyển đổi
                      </div>
                      <div className="text-2xl font-bold text-purple-600">
                        {dashboardData.summary.conversionRate}
                      </div>
                      <div className="text-xs text-gray-400">
                        {' '}
                        {filters.startDate && filters.endDate
                          ? `Từ ${filters.startDate.toLocaleDateString(
                              'vi-VN'
                            )} đến ${filters.endDate.toLocaleDateString(
                              'vi-VN'
                            )}`
                          : filters.startDate
                          ? `Từ ${filters.startDate.toLocaleDateString(
                              'vi-VN'
                            )}`
                          : filters.endDate
                          ? `Đến ${filters.endDate.toLocaleDateString('vi-VN')}`
                          : 'Không giới hạn thời gian	'}{' '}
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow border">
                      <div className="text-sm font-medium text-gray-500">
                        Thời gian tư vấn TB
                      </div>
                      <div className="text-2xl font-bold text-orange-600">
                        {dashboardData.summaryChart.averageDuration} Phút
                      </div>
                      <div className="text-xs text-gray-400">
                        {filters.startDate && filters.endDate
                          ? `Từ ${filters.startDate.toLocaleDateString(
                              'vi-VN'
                            )} đến ${filters.endDate.toLocaleDateString(
                              'vi-VN'
                            )}`
                          : filters.startDate
                          ? `Từ ${filters.startDate.toLocaleDateString(
                              'vi-VN'
                            )}`
                          : filters.endDate
                          ? `Đến ${filters.endDate.toLocaleDateString('vi-VN')}`
                          : 'Không giới hạn thời gian	'}{' '}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className="px-4 lg:px-6 py-2">
                {/* Component biểu đồ stacked (ẩn) */}
                <ConsultationDurationAreaChart
                  sessions={sessions}
                  title="Phân tích thời lượng tư vấn"
                  description="Thống kê thời lượng trung bình mỗi ngày"
                />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

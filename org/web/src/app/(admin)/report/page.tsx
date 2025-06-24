'use client';

import * as React from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

// Import components
// Import Component, nhưng cần biết nó chấp nhận props gì để sử dụng data
import { Component } from '@/components/chart-stacked';
import { RadarChartGridCircle } from '@/components/radar-chart';
import { RadialChartStacked } from '@/components/radial-chart';

// Import hooks
import {
  useConsultationsByMonth,
  useCampaignEffectiveness,
  useDashboardOverview,
} from '@/hooks/useChart';

// Loading skeleton component
const ChartSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
    <div className="h-64 bg-gray-200 rounded"></div>
  </div>
);

// Error component
const ChartError = ({ message }: { message?: string }) => (
  <div className="flex items-center justify-center h-64 border border-red-200 rounded-lg bg-red-50">
    <div className="text-center">
      <div className="text-red-600 mb-2">⚠️ Lỗi tải dữ liệu</div>
      <div className="text-sm text-red-500">
        {message || 'Không thể tải dữ liệu biểu đồ'}
      </div>
      <button
        onClick={() => window.location.reload()}
        className="mt-2 px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
      >
        Thử lại
      </button>
    </div>
  </div>
);

export default function Page() {
  // Get current year for consultations filter
  const currentYear = new Date().getFullYear();

  // Fetch consultations data for radar chart
  const {
    data: consultationsData,
    isLoading: consultationsLoading,
    error: consultationsError,
    refetch: refetchConsultations,
  } = useConsultationsByMonth({
    year: currentYear,
    // status: 'Completed' // Uncomment if you want to filter by status
  });

  // Fetch campaigns data for radial chart
  const {
    data: campaignsData,
    isLoading: campaignsLoading,
    error: campaignsError,
    refetch: refetchCampaigns,
  } = useCampaignEffectiveness({
    monthsBack: 6, // Get last 6 months data
  });

  // Optional: Fetch overview data if needed
  const {
    data: overviewData,
    isLoading: overviewLoading,
    error: overviewError,
  } = useDashboardOverview();

  // Handle refresh for all data
  const handleRefreshAll = () => {
    refetchConsultations();
    refetchCampaigns();
  };

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
              {/* Header with refresh button */}
              <div className="container mx-auto px-4">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h1 className="text-2xl font-bold">Dashboard Analytics</h1>
                    {overviewData?.lastUpdated && (
                      <p className="text-sm text-gray-500">
                        Cập nhật lần cuối:{' '}
                        {new Date(overviewData.lastUpdated).toLocaleString(
                          'vi-VN'
                        )}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handleRefreshAll}
                    disabled={consultationsLoading || campaignsLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {consultationsLoading || campaignsLoading
                      ? 'Đang tải...'
                      : 'Làm mới'}
                  </button>
                </div>
              </div>

              <div className="container mx-auto py-8">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 mx-4">
                  {/* Radar Chart - Consultations Data */}
                  <div className="space-y-2">
                    {consultationsLoading ? (
                      <ChartSkeleton />
                    ) : consultationsError ? (
                      <ChartError message={consultationsError.message} />
                    ) : (
                      <RadarChartGridCircle
                        colorSet="C"
                        title="Lượt tư vấn theo tuần/tháng"
                        description="Lưu lượng tư vấn và học viên đăng ký học"
                        // Pass consultations data to chart
                        data={consultationsData}
                      />
                    )}
                  </div>

                  {/* Radial Chart - Campaigns Data */}
                  <div className="space-y-2 flex flex-col justify-center">
                    {campaignsLoading ? (
                      <ChartSkeleton />
                    ) : campaignsError ? (
                      <ChartError message={campaignsError.message} />
                    ) : (
                      <RadialChartStacked
                        // Pass campaigns data to chart
                        data={campaignsData}
                      />
                    )}
                  </div>
                </div>

                {/* Summary Stats */}
                {overviewData && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mx-4 mt-6">
                    <div className="bg-white p-4 rounded-lg shadow border">
                      <div className="text-sm font-medium text-gray-500">
                        Tổng tư vấn
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {overviewData.consultations.summary.totalConsultations.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        {overviewData.consultations.summary.trendingText}
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow border">
                      <div className="text-sm font-medium text-gray-500">
                        Tổng khách truy cập
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        {overviewData.campaigns.summary.totalVisitors.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        {overviewData.campaigns.summary.trendingText}
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow border">
                      <div className="text-sm font-medium text-gray-500">
                        Tỷ lệ chuyển đổi
                      </div>
                      <div className="text-2xl font-bold text-purple-600">
                        {overviewData.campaigns.summary.conversionRate}
                      </div>
                      <div className="text-xs text-gray-400">
                        Trong {overviewData.campaigns.summary.period}
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow border">
                      <div className="text-sm font-medium text-gray-500">
                        Thời gian tư vấn TB
                      </div>
                      <div className="text-2xl font-bold text-orange-600">
                        {overviewData.consultations.summary.averageDuration}{' '}
                        phút
                      </div>
                      <div className="text-xs text-gray-400">
                        Tăng trưởng{' '}
                        {overviewData.consultations.summary.growthRate}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="px-4 lg:px-6">
                {/* Truyền dữ liệu và trạng thái loading/error cho Component */}
                <Component
                  data={consultationsData}
                  isLoading={consultationsLoading}
                  error={consultationsError}
                />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

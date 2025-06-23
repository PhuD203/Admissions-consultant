// src/app/(admin)/dashboard/page.tsx
'use client';

import * as React from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { ChartAreaInteractive } from '@/components/chart-area-interactive';
import { DataTable } from '@/components/data-table';
import { SectionCards } from '@/components/section-cards';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

import {
  consultingApiResponseSchema,
  ConsultingTableRow,
  Metadata,
  consultingDataSchema,
} from '@/lib/schema/consulting-data-schema';

// Import các hooks
import {
  useConsultingList,
  useSearchConsultingList,
} from '@/hooks/useConsulting';
import { useUpdateConsulting } from '@/hooks/useUpdate';

// Import để invalidate cache
import { useQueryClient } from '@tanstack/react-query';

export default function Page() {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isRefetching, setIsRefetching] = React.useState(false);

  // Initialize query client để invalidate cache sau khi update
  const queryClient = useQueryClient();

  // Hook để lấy dữ liệu
  const { data, isLoading, isError, error, isFetching, refetch } = searchTerm
    ? (console.log(
        `page.tsx: LOGIC activated: Using useSearchConsultingList for term "${searchTerm}" (page: ${currentPage}, limit: ${itemsPerPage})`
      ),
      useSearchConsultingList(searchTerm, currentPage, itemsPerPage))
    : (console.log(
        `page.tsx: LOGIC activated: Using useConsultingList (page: ${currentPage}, limit: ${itemsPerPage})`
      ),
      useConsultingList(currentPage, itemsPerPage));

  // Hook để cập nhật dữ liệu
  const updateConsultingMutation = useUpdateConsulting({
    onSuccess: async (updatedData) => {
      console.log('page.tsx: Update successful:', updatedData);
      
      try {
        // Đợi 5 giây trước khi hiển thị spinner
        console.log('page.tsx: Waiting 5 seconds before showing spinner...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Bắt đầu hiển thị spinner sau 5s
        setIsRefetching(true);

        // Invalidate và refetch dữ liệu để cập nhật UI
        // Invalidate cả hai loại query (list và search)
        await queryClient.invalidateQueries({
          queryKey: ['consulting-list'],
        });
        await queryClient.invalidateQueries({
          queryKey: ['consulting-search'],
        });

        // Refetch query hiện tại để đảm bảo dữ liệu được cập nhật ngay lập tức
        await refetch();

        // Có thể thêm delay nhỏ để người dùng thấy spinner (tùy chọn)
        await new Promise(resolve => setTimeout(resolve, 500));

        console.log('page.tsx: Refetch completed successfully');
      } catch (error) {
        console.error('page.tsx: Refetch error:', error);
      } finally {
        // Ẩn spinner sau khi hoàn thành
        setIsRefetching(false);
      }
    },
    onError: (error) => {
      console.error('page.tsx: Update failed:', error);
      setIsRefetching(false); // Đảm bảo ẩn spinner khi có lỗi
    },
  });

  // Debug: Theo dõi trạng thái của hook React Query
  React.useEffect(() => {
    console.log(
      `page.tsx: HOOK STATUS - isLoading: ${isLoading}, isFetching: ${isFetching}, isError: ${isError}, isRefetching: ${isRefetching}`
    );
    if (error) {
      console.error('page.tsx: HOOK ERROR:', error);
    }
  }, [isLoading, isFetching, isError, error, isRefetching]);

  const typedData = React.useMemo(() => {
    if (data) {
      console.log('page.tsx: RAW DATA from API (from hook):', data);

      try {
        const parsedResponse = consultingApiResponseSchema.parse(data);
        console.log(
          'page.tsx: PARSED DATA - consultingInformation:',
          parsedResponse.data.consultingInformation
        );
        console.log(
          'page.tsx: PARSED DATA - metadata:',
          parsedResponse.data.metadata
        );
        return {
          consultingInformation: parsedResponse.data.consultingInformation,
          metadata: parsedResponse.data.metadata,
        };
      } catch (e) {
        console.error(
          'page.tsx: ERROR parsing API response with Zod schema:',
          e
        );
        return {
          consultingInformation: [],
          metadata: {
            totalRecords: 0,
            firstPage: 1,
            lastPage: 1,
            page: 1,
            limit: 10,
          },
        };
      }
    }
    console.log('page.tsx: Data is not available yet or is null.');
    return {
      consultingInformation: [],
      metadata: {
        totalRecords: 0,
        firstPage: 1,
        lastPage: 1,
        page: 1,
        limit: 10,
      },
    };
  }, [data]);

  const consultingData: ConsultingTableRow[] = typedData.consultingInformation;
  const metadata: Metadata = typedData.metadata;

  // Debug: Kiểm tra dữ liệu cuối cùng được truyền xuống DataTable
  React.useEffect(() => {
    console.log(
      'page.tsx: DATA FOR DATATABLE - consultingData length:',
      consultingData.length
    );
    console.log('page.tsx: DATA FOR DATATABLE - metadata:', metadata);
  }, [consultingData, metadata]);

  // Handlers
  const onPageChange = (page: number) => {
    console.log(`page.tsx: Page change requested to page: ${page}`);
    setCurrentPage(page);
  };

  const onItemsPerPageChange = (limit: number) => {
    console.log(`page.tsx: Items per page change requested to limit: ${limit}`);
    setItemsPerPage(limit);
    setCurrentPage(1);
  };

  const handleSearch = React.useCallback((searchTermValue: string) => {
    console.log(
      'page.tsx: handleSearch CALLED - updating searchTerm to:',
      searchTermValue
    );
    setSearchTerm(searchTermValue);
    setCurrentPage(1);
  }, []);

  // Handler để cập nhật dữ liệu consulting
  const handleUpdateConsulting = React.useCallback(
    async (studentId: number, updateData: Partial<ConsultingTableRow>) => {
      console.log(
        'page.tsx: handleUpdateConsulting CALLED - studentId:',
        studentId,
        'updateData:',
        updateData
      );

      try {
        // Chỉ validate với student_id và các trường được gửi
        const validatedData = {
          student_id: studentId,
          ...updateData,
        };

        // Gọi mutation để cập nhật
        await updateConsultingMutation.mutateAsync({
          studentId,
          updateData: validatedData, // Gửi dữ liệu đã được chuẩn bị
        });

        console.log('page.tsx: Update completed successfully');
      } catch (error) {
        console.error('page.tsx: Update error:', error);
        // Error đã được handle trong hook
      }
    },
    [updateConsultingMutation]
  );

  // Loading và Error states
  if (isLoading) {
    console.log('page.tsx: Displaying loading state...');
    return <div>Đang tải dữ liệu...</div>;
  }

  if (isError) {
    console.error('page.tsx: Displaying error state:', error);
    return (
      <div>Có lỗi xảy ra: {error?.message || 'Không thể tải dữ liệu.'}</div>
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
        <div className="flex flex-1 flex-col relative">
          {/* Spinner overlay khi đang refetch sau update */}
          {isRefetching && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-sm font-medium text-gray-700">
                  Đang cập nhật danh sách...
                </p>
              </div>
            </div>
          )}
          
          <div className="flex flex-1 flex-col gap-2 @container/main">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
              <DataTable
                data={consultingData}
                metadata={metadata}
                onPageChange={onPageChange}
                onItemsPerPageChange={onItemsPerPageChange}
                onSearch={handleSearch}
                onUpdate={handleUpdateConsulting}
                currentSearchTerm={searchTerm}
                isSearching={isFetching}
                isUpdating={updateConsultingMutation.isPending} // Trạng thái updating
              />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
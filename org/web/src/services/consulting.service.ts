import apiClient from '@/lib/axios.lib';
import {
  ConsultingApiResponseHistory,
  consultingApiResponseSchemaHistory,
} from '@/lib/schema/consulting-data-history';
import { ConsultingApiResponse } from '@/lib/schema/consulting-data-schema';

export const consultingService = {
  // Hàm đã có và sử dụng apiClient
  getConsultingInformation: async (
    page: number = 1,
    limit: number = 10
  ): Promise<ConsultingApiResponse> => {
    try {
      console.log(
        `consulting.service.ts: Fetching all consulting info (page: ${page}, limit: ${limit})`
      );
      const response = await apiClient.get(
        '/consulting-information-management', // <-- Đảm bảo đây là endpoint đúng cho danh sách chung
        {
          params: {
            page: page,
            limit: limit,
          },
        }
      );
      console.log(
        'consulting.service.ts: Response for all consulting info:',
        response.data
      );
      return response.data; // Axios tự động parse JSON và ném lỗi cho status codes 4xx/5xx
    } catch (error: any) {
      console.error('Error fetching consulting information:', error);
      // Axios errors thường có response.data, response.status, v.v.
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      throw error; // Ném lại lỗi để React Query có thể bắt
    }
  },

  // Cập nhật hàm này để sử dụng apiClient
  async getConsultingInformationByConselorId(
    counselorId: number = 6, // counselorId bây giờ là bắt buộc nếu dùng path param, nhưng bạn có thể xử lý undefined
    page: number = 1,
    limit: number = 10
  ): Promise<ConsultingApiResponse> {
    try {
      // Kiểm tra nếu counselorId không tồn tại, bạn có thể ném lỗi hoặc gọi hàm chung
      if (counselorId === undefined || counselorId === null) {
        // Hoặc gọi getConsultingInformation (hàm chung) nếu không có counselorId
        // return this.getConsultingInformation(page, limit);
        throw new Error('Counselor ID is required for this specific endpoint.');
      }

      console.log(
        `consulting.service.ts: Fetching by counselorId (path param) "${counselorId}" (page: ${page}, limit: ${limit})`
      );
      const response = await apiClient.get(
        // Thay đổi URL để bao gồm counselorId trong path
        `/consulting-information-management/counselorId`, // <-- SỬA ĐƯỜNG DẪN NÀY
        {
          params: {
            // page và limit vẫn là query params
            page: page,
            limit: limit,
          },
        }
      );
      console.log(
        'consulting.service.ts: Response for consulting by counselorId:',
        response.data
      );
      return response.data;
    } catch (error: any) {
      console.error(
        'Error fetching consulting information by counselor ID:',
        error
      );
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      throw error;
    }
  },

  // Cập nhật hàm này để sử dụng apiClient
  async searchConsultingInformation(
    name: string,
    page: number = 1, // Đặt giá trị mặc định
    limit: number = 10 // Đặt giá trị mặc định
  ): Promise<ConsultingApiResponse> {
    // Thêm kiểu trả về
    try {
      console.log(
        `consulting.service.ts: Searching consulting info for term "${name}" (page: ${page}, limit: ${limit})`
      );
      const response = await apiClient.get(
        '/consulting-information-management/search', // <-- Đặt đúng endpoint API của bạn cho tìm kiếm theo tên
        {
          params: {
            name: name,
            page: page,
            limit: limit,
          },
        }
      );
      console.log(
        'consulting.service.ts: Response for search consulting info:',
        response.data
      );
      // Tương tự, nếu API trả về JSend, chỉ cần trả về response.data
      return response.data;
    } catch (error: any) {
      console.error('Error searching consulting information:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      throw error;
    }
  },

  // Thêm vào consultingService object
  updateConsultingInformation: async (
    studentId: number,
    updateData: any // Bạn có thể định nghĩa interface cụ thể cho updateData
  ): Promise<any> => {
    // Có thể định nghĩa return type cụ thể
    try {
      console.log(
        `consulting.service.ts: Updating consulting info for studentId: ${studentId}`,
        updateData
      );

      // Tạo URL với studentId trong path
      let url = `/consulting-information-management/${studentId}`;

      // Tạo config cho request
      const config: any = {
        // Headers nếu cần
      };

      const response = await apiClient.put(url, updateData, config);

      console.log(
        'consulting.service.ts: Response for update consulting info:',
        response.data
      );

      return response.data;
    } catch (error: any) {
      console.error('Error updating consulting information:', error);

      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);

        // Xử lý các loại lỗi cụ thể
        if (error.response.status === 404) {
          throw new Error('Student not found or update failed.');
        } else if (error.response.status === 400) {
          throw new Error(
            error.response.data?.message || 'Invalid data provided.'
          );
        } else if (error.response.status === 422) {
          throw new Error('Validation failed. Please check your input data.');
        }
      }

      throw error; // Ném lại lỗi để React Query có thể bắt
    }
  },

  async getConsultingInformationHistoryByConselorId(
    page: number = 1,
    limit: number = 10
  ): Promise<ConsultingApiResponseHistory> {
    try {
      const response = await apiClient.get(
        // Thay đổi URL để bao gồm counselorId trong path
        `/consulting-information-management/history`,
        {
          params: {
            page: page,
            limit: limit,
          },
        }
      );
      console.log(
        'consulting.service.ts: Response for consulting by counselorId:',
        response.data
      );
      return response.data;
    } catch (error: any) {
      console.error(
        'Error fetching consulting information by counselor ID:',
        error
      );
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      throw error;
    }
  },
};

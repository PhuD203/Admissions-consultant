import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {consultingService} from '../services/consulting.service';
import { consultingApiResponseSchema } from '@/lib/schema/consulting-data-schema';


export const useConsultingList = (
  page: number = 1,
  limit: number = 10,
  counselorId?: number 
) => {
  return useQuery({

    queryKey: ['consultingList', counselorId, page, limit], 
    queryFn: async () => {
      const response = await consultingService.getConsultingInformationByConselorId(
        counselorId,
        page,
        limit
      );
      const parsedResponse = consultingApiResponseSchema.parse(response);
      return parsedResponse;
    },
    placeholderData: (previousData) => previousData,

  });
};

export const useSearchConsultingList = (
  name: string, 
  page: number = 1,
  limit: number = 10
) => {
  return useQuery({
    queryKey: ['consultingSearch', name, page, limit], 
    queryFn: async () => {
      const response = await consultingService.searchConsultingInformation(
        name,
        page,
        limit
      );
      const parsedResponse = consultingApiResponseSchema.parse(response);
      return parsedResponse;
    },

    enabled: !!name && name.trim().length > 0, 

    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000, 
    
  });
};
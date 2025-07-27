// "use client"

// import { TrendingUp, TrendingDown, Activity } from "lucide-react"
// import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"

// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card"
// import {
//   ChartConfig,
//   ChartContainer,
//   ChartTooltip,
//   ChartTooltipContent,
// } from "@/components/ui/chart"

// // Import types từ service
// import { ConsultationAnalyticsResult } from "@/services/report.service"

// // Định nghĩa props cho component Radar Chart
// interface RadarChartProps {
//   colorSet: "C" | "D";
//   title?: string;
//   description?: string;
//   data?: ConsultationAnalyticsResult; // Thêm prop data từ API
// }

// // Không cần dữ liệu mẫu vì data đã được truyền từ component cha

// // Hàm chuyển đổi dữ liệu API thành format cho radar chart
// function transformApiDataToChartData(apiData: ConsultationAnalyticsResult) {
//   return apiData.chartData.chartData.map(item => ({
//     month: item.month,
//     phoneCall: item.phoneCall,
//     onlineMeeting: item.onlineMeeting,
//     inPerson: item.inPerson,
//     email: item.email,
//     chat: item.chat,
//   }));
// }

// // Hàm để lấy cấu hình biểu đồ và dữ liệu
// function getChartConfigAndData(colorSet: "C" | "D", apiData?: ConsultationAnalyticsResult) {
//   if (colorSet === "C") {
//     // Chỉ sử dụng dữ liệu từ API
//     if (!apiData) {
//       return null; // Trả về null nếu không có data
//     }

//     const chartData = transformApiDataToChartData(apiData);

//     const configC = {
//       phoneCall: {
//         label: apiData.chartData.config.phoneCall.label,
//         color: apiData.chartData.config.phoneCall.color,
//       },
//       onlineMeeting: {
//         label: apiData.chartData.config.onlineMeeting.label,
//         color: apiData.chartData.config.onlineMeeting.color,
//       },
//       inPerson: {
//         label: apiData.chartData.config.inPerson.label,
//         color: apiData.chartData.config.inPerson.color,
//       },
//       email: {
//         label: apiData.chartData.config.email.label,
//         color: apiData.chartData.config.email.color,
//       },
//       chat: {
//         label: apiData.chartData.config.chat.label,
//         color: apiData.chartData.config.chat.color,
//       },
//     } satisfies ChartConfig;

//     // Xác định trend direction
//     const growthRate = apiData.summary.growthRate;
//     const isPositiveTrend = growthRate.startsWith('+') || !growthRate.startsWith('-');

//     return {
//       data: chartData,
//       config: configC,
//       dataKeys: ['phoneCall', 'onlineMeeting', 'inPerson', 'email', 'chat'],
//       polarAngleAxisDataKey: "month",
//       title: "Lượt tư vấn theo hình thức",
//       description: "Phân bố các hình thức tư vấn theo tháng",
//       trendIcon: isPositiveTrend ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />,
//       trendText: `${isPositiveTrend ? 'Tăng' : 'Giảm'} ${growthRate} so với kỳ trước`,
//       footerText: apiData.summary.period,
//       totalConsultations: apiData.summary.totalConsultations,
//       averageDuration: apiData.summary.averageDuration,
//     };
//   } else { // colorSet === "D"
//     // Không support colorSet D cho consultations data
//     return null;
//   }
// }

// export function RadarChartGridCircle({ colorSet, title, description, data }: RadarChartProps) {
//   const chartConfig = getChartConfigAndData(colorSet, data);

//   // Không render nếu không có data hoặc config
//   if (!chartConfig) {
//     return (
//       <Card>
//         <CardHeader className="items-center pb-4">
//           <CardTitle className="flex items-center gap-2">
//             <Activity className="h-5 w-5" />
//             {title || "Lượt tư vấn theo hình thức"}
//           </CardTitle>
//           <CardDescription>
//             {description || "Đang tải dữ liệu..."}
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="pb-0">
//           <div className="mx-auto aspect-square max-h-[280px] flex items-center justify-center">
//             <p className="text-muted-foreground">Không có dữ liệu</p>
//           </div>
//         </CardContent>
//       </Card>
//     );
//   }

//   const {
//     data: chartData,
//     config,
//     dataKeys,
//     polarAngleAxisDataKey,
//     title: defaultTitle,
//     description: defaultDescription,
//     trendIcon,
//     trendText,
//     footerText,
//     totalConsultations,
//     averageDuration,
//   } = chartConfig;

//   return (
//     <Card>
//       <CardHeader className="items-center pb-4">
//         <CardTitle className="flex items-center gap-2">
//           <Activity className="h-5 w-5" />
//           {title || defaultTitle}
//         </CardTitle>
//         <CardDescription>
//           {description || defaultDescription}
//         </CardDescription>

//         {/* Hiển thị thống kê tổng quan */}
//         {data && colorSet === "C" && (
//           <div className="flex gap-4 text-sm text-muted-foreground mt-2">
//             <span>Tổng: <strong>{totalConsultations.toLocaleString()}</strong></span>
//             <span>TB: <strong>{averageDuration} phút</strong></span>
//           </div>
//         )}
//       </CardHeader>

//       <CardContent className="pb-0">
//         <ChartContainer
//           config={config}
//           className="mx-auto aspect-square max-h-[280px]"
//         >
//           <RadarChart data={chartData}>
//             <ChartTooltip
//               cursor={false}
//               content={<ChartTooltipContent
//                 hideLabel={false}
//                 labelKey={polarAngleAxisDataKey}
//                 formatter={(value, name) => [
//                   value,
//                   config[name as keyof typeof config]?.label || name
//                 ]}
//               />}
//             />
//             <PolarGrid gridType="polygon" />
//             <PolarAngleAxis
//               dataKey={polarAngleAxisDataKey}
//               className="text-xs"
//             />

//             {/* Render tất cả các data keys */}
//             {dataKeys.map((key, index) => (
//               <Radar
//                 key={key}
//                 dataKey={key}
//                 stroke={config[key as keyof typeof config]?.color}
//                 fill={config[key as keyof typeof config]?.color}
//                 fillOpacity={0.1 + (index * 0.1)} // Tăng dần opacity
//                 strokeWidth={2}
//                 dot={{
//                   r: 3,
//                   fillOpacity: 1,
//                 }}
//               />
//             ))}
//           </RadarChart>
//         </ChartContainer>
//       </CardContent>

//       <CardFooter className="flex-col gap-2 text-sm">
//         <div className="flex items-center gap-2 font-medium leading-none">
//           {trendText} {trendIcon}
//         </div>
//         <div className="flex items-center gap-2 leading-none text-muted-foreground">
//           {footerText}
//         </div>

//         {/* Hiển thị trending text từ API */}
//         {data?.summary.trendingText && (
//           <div className="text-xs text-center text-muted-foreground border-t pt-2 mt-1">
//             {data.summary.trendingText}
//           </div>
//         )}
//       </CardFooter>
//     </Card>
//   )
// }

'use client';

import { Activity } from 'lucide-react';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

import { ConsultationAnalyticsResult } from '@/services/report.service';

interface RadarChartProps {
  colorSet: 'C' | 'D';
  title?: string;
  description?: string;
  data?: ConsultationAnalyticsResult;
}

const config = {
  phoneCall: { label: 'Gọi điện', color: '#3b82f6' },
  onlineMeeting: {
    label: 'Họp online',
    color: '#10b981',
  },
  inPerson: {
    label: 'Gặp trực tiếp',
    color: '#f59e0b',
  },
  email: { label: 'Email', color: '#ef4444' },
  chat: { label: 'Chat', color: '#8b5cf6' },
};

function transformTotalDataToChartData(apiData: ConsultationAnalyticsResult) {
  // const config = apiData.chartData.config;
  const items = apiData.chartData.chartData;

  const methodKeys: (keyof typeof config)[] = Object.keys(
    config
  ) as (keyof typeof config)[];

  const totals: Record<string, number> = {};

  items.forEach((item) => {
    methodKeys.forEach((key) => {
      totals[key] = (totals[key] || 0) + item[key]!;
    });
  });

  return methodKeys.map((key) => ({
    method: config[key].label,
    value: totals[key],
  }));
}

export function RadarChartGridCircle({
  colorSet,
  title,
  description,
  data,
}: RadarChartProps) {
  if (colorSet !== 'C' || !data) {
    return (
      <Card>
        <CardHeader className="items-center pb-4">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {title || 'Lượt tư vấn theo hình thức'}
          </CardTitle>
          <CardDescription>
            {description || 'Không có dữ liệu để hiển thị'}
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-0">
          <div className="mx-auto aspect-square max-h-[280px] flex items-center justify-center">
            <p className="text-muted-foreground">Không có dữ liệu</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = transformTotalDataToChartData(data);
  // const config = data.chartData.config;

  return (
    <Card>
      <CardHeader className="items-center pb-4">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="pb-0">
        <ChartContainer className="mx-auto max-h-[270px]" config={config}>
          <RadarChart data={chartData} outerRadius={110}>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel={true}
                  formatter={(value) => [
                    `Tổng: ${Number(value) || 0} lượt`,
                    '',
                  ]}
                />
              }
            />

            <PolarGrid gridType="polygon" />
            <PolarAngleAxis dataKey="method" className="text-xs" />
            <Radar
              name="Lượt tư vấn"
              dataKey="value"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.3}
              strokeWidth={2}
              dot={{ r: 3, fillOpacity: 1 }}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col gap-2 text-sm">
        {/* Tổng quan */}
        <div className="text-muted-foreground">
          Tổng lượt:{' '}
          <strong>{data.summary.totalConsultations.toLocaleString()}</strong> |
          TB thời lượng: <strong>{data.summary.averageDuration} phút</strong>
        </div>

        {/* Danh sách từng hình thức và số lượng */}
        <div className="grid grid-cols-2 gap-2 text-muted-foreground text-xs w-full mt-2">
          {chartData.map((item) => (
            <div
              key={item.method}
              className="flex justify-between border-b pb-1"
            >
              <span>{item.method}</span>
              <span className="font-semibold text-right">
                {item.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        {/* Text xu hướng nếu có */}
        {data.summary.trendingText && (
          <div className="text-md text-center text-muted-foreground border-t pt-2 mt-1">
            {data.summary.trendingText}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

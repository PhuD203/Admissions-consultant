"use client"

import { TrendingUp, TrendingDown } from "lucide-react"
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig, // Đảm bảo ChartConfig được import
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

// Định nghĩa props cho component Radar Chart
interface RadarChartProps {
  colorSet: "C" | "D"; // Prop để chọn bộ màu "C" hoặc "D"
  title?: string;
  description?: string;
}

// Dữ liệu mẫu cho bộ màu C (Ví dụ: dữ liệu về hiệu suất hàng tháng)
const chartDataC = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 203, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
];

// Dữ liệu mẫu cho bộ màu D (Ví dụ: dữ liệu về xếp hạng sản phẩm)
const chartDataD = [
  { category: "Design", value: 80, average: 65 },
  { category: "Usability", value: 90, average: 75 },
  { category: "Performance", value: 70, average: 80 },
  { category: "Features", value: 95, average: 70 },
  { category: "Support", value: 85, average: 60 },
];

// Hàm để lấy cấu hình biểu đồ và dữ liệu dựa trên colorSet
function getChartConfigAndData(colorSet: "C" | "D") {
  if (colorSet === "C") {
    const configC = { // Khai báo rõ ràng config cho C
      desktop: {
        label: "Desktop Traffic",
        color: "hsl(var(--chart-C-1))",
      },
      mobile: {
        label: "Mobile Traffic",
        color: "hsl(var(--chart-C-2))",
      },
    } satisfies ChartConfig; // <-- Sử dụng satisfies ChartConfig ở đây

    return {
      data: chartDataC,
      config: configC, // Truyền config C
      mainDataKey: "desktop",
      secondDataKey: "mobile",
      polarAngleAxisDataKey: "month",
      title: "Radar Chart C - Traffic Overview",
      description: "Showing total visitors for the last 6 months",
      trendIcon: <TrendingUp className="h-4 w-4" />,
      trendText: "Trending up by 5.2% this month",
      footerText: "January - June 2024",
    };
  } else { // colorSet === "D"
    const configD = { // Khai báo rõ ràng config cho D
      value: {
        label: "Your Score",
        color: "hsl(var(--chart-D-1))",
      },
      average: {
        label: "Average Score",
        color: "hsl(var(--chart-D-2))",
      },
    } satisfies ChartConfig; // <-- Sử dụng satisfies ChartConfig ở đây

    return {
      data: chartDataD,
      config: configD, // Truyền config D
      mainDataKey: "value",
      secondDataKey: "average",
      polarAngleAxisDataKey: "category",
      title: "Radar Chart D - Product Ratings",
      description: "Comparison of product features",
      trendIcon: <TrendingDown className="h-4 w-4" />,
      trendText: "Average score decreased by 1.5% this quarter",
      footerText: "Q1 - Q4 2024",
    };
  }
}

export function RadarChartGridCircle({ colorSet, title, description }: RadarChartProps) {
  const {
    data,
    config,
    mainDataKey,
    secondDataKey,
    polarAngleAxisDataKey,
    title: defaultTitle,
    description: defaultDescription,
    trendIcon,
    trendText,
    footerText,
  } = getChartConfigAndData(colorSet);

  return (
    <Card>
      <CardHeader className="items-center pb-4">
        <CardTitle>{title || defaultTitle}</CardTitle>
        <CardDescription>
          {description || defaultDescription}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer
          config={config}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadarChart data={data}>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <PolarGrid gridType="circle" radialLines={false} />
            <PolarAngleAxis dataKey={polarAngleAxisDataKey} />

            <Radar
              dataKey={mainDataKey}
              fill={`hsl(var(--chart-${colorSet}-1))`}
              fillOpacity={0.6}
              dot={{
                r: 4,
                fillOpacity: 1,
              }}
            />

            {secondDataKey && (
              <Radar
                dataKey={secondDataKey}
                fill={`hsl(var(--chart-${colorSet}-2))`}
                fillOpacity={0.6}
                dot={{
                  r: 4,
                  fillOpacity: 1,
                }}
              />
            )}
          </RadarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          {trendText} {trendIcon}
        </div>
        <div className="flex items-center gap-2 leading-none text-muted-foreground">
          {footerText}
        </div>
      </CardFooter>
    </Card>
  )
}

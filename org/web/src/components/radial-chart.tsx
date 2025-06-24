"use client"

import { TrendingUp } from "lucide-react"
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

// Type definitions for the API data structure
interface CampaignData {
  gaugeData: {
    value: number;
    maxValue: number;
    color: string;
    status: string;
    title: string;
  };
  summary: {
    totalVisitors: number;
    totalRegistered: number;
    totalEngaging: number;
    conversionRate: string;
    engagementRate: string;
    growthRate: string;
    period: string;
    trendingText: string;
  };
  sourceBreakdown: Array<{
    source: string;
    totalLeads: number;
    engagingCount: number;
    registeredCount: number;
    droppedCount: number;
    conversionRate: string;
    engagementRate: string;
    avgConversionDays: number;
  }>;
}

interface RadialChartStackedProps {
  data?: CampaignData;
}

const chartConfig = {
  registered: {
    label: "Đã đăng ký",
    color: "hsl(var(--chart-1))",
  },
  engaging: {
    label: "Đang tương tác",
    color: "hsl(var(--chart-2))",
  },
  visitors: {
    label: "Khách truy cập",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

export function RadialChartStacked({ data }: RadialChartStackedProps) {
  // Handle loading state or no data
  if (!data) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Hiệu quả chiến dịch</CardTitle>
          <CardDescription>Đang tải dữ liệu...</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse">
              <div className="w-48 h-48 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Transform API data for the chart
  const chartData = [
    {
      period: data.summary.period,
      registered: data.summary.totalRegistered,
      engaging: data.summary.totalEngaging,
      visitors: data.summary.totalVisitors - data.summary.totalRegistered - data.summary.totalEngaging,
    }
  ]

  // Calculate total for center display
  const totalVisitors = data.summary.totalVisitors

  // Parse growth rate for trending display
  const growthRate = parseFloat(data.summary.growthRate.replace('%', ''))
  const isPositiveTrend = growthRate >= 0

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Hiệu quả chiến dịch</CardTitle>
        <CardDescription>{data.summary.period}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadialBarChart
            data={chartData}
            endAngle={180}
            innerRadius={80}
            outerRadius={130}
          >
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent 
                  hideLabel 
                  nameKey="period"
                  formatter={(value, name) => [
                    `${value} người`,
                    chartConfig[name as keyof typeof chartConfig]?.label || name
                  ]}
                />
              }
            />
            <PolarRadiusAxis tick={false} tickCount={7} axisLine={false} />
            <RadialBar
              dataKey="visitors"
              stackId="a"
              cornerRadius={5}
              fill="var(--color-visitors)"
              className="stroke-transparent stroke-2"
            />
            <RadialBar
              dataKey="engaging"
              stackId="a"
              cornerRadius={5}
              fill="var(--color-engaging)"
              className="stroke-transparent stroke-2"
            />
            <RadialBar
              dataKey="registered"
              stackId="a"
              cornerRadius={5}
              fill="var(--color-registered)"
              className="stroke-transparent stroke-2"
            />
            <Label
              content={({ viewBox }) => {
                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                  return (
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        x={viewBox.cx}
                        y={viewBox.cy}
                        className="fill-foreground text-4xl font-bold"
                      >
                        {totalVisitors.toLocaleString()}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 24}
                        className="fill-muted-foreground"
                      >
                        Khách truy cập
                      </tspan>
                    </text>
                  )
                }
              }}
            />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          {isPositiveTrend ? (
            <>
              Tăng trưởng {Math.abs(growthRate)}% trong kỳ này
              <TrendingUp className="h-4 w-4" />
            </>
          ) : (
            <>
              Giảm {Math.abs(growthRate)}% trong kỳ này
              <TrendingUp className="h-4 w-4 rotate-180" />
            </>
          )}
        </div>
        <div className="flex items-center gap-2 leading-none text-muted-foreground">
          Tỷ lệ chuyển đổi: {data.summary.conversionRate} | 
          Tỷ lệ tương tác: {data.summary.engagementRate}
        </div>
        <div className="leading-none text-muted-foreground">
          {data.summary.trendingText}
        </div>
      </CardFooter>
    </Card>
  )
}
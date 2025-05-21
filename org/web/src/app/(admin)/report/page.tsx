"use client"

import * as React from "react" // Cần React để sử dụng useState nếu bạn muốn làm dữ liệu động
import { AppSidebar } from "@/components/app-sidebar"

import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

// Import schema từ file data-table.tsx
import { Component } from "@/components/chart-stacked"
import { RadarChartGridCircle } from "@/components/radar-chart"
import { RadialChartStacked } from "@/components/radial-chart"



export default function Page() {

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="container mx-auto py-8"> {/* Thêm 'container', 'mx-auto', 'py-8' */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 mx-4">

                  <RadarChartGridCircle
                    colorSet="C"
                    title="Lượt tư vấn theo tuần/tháng"
                    description="Lưu lượng tư vấn và học viên đăng ký học"
                  />


                  <RadialChartStacked
                  />
                </div>
              </div>
              <div className="px-4 lg:px-6">
                <Component />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

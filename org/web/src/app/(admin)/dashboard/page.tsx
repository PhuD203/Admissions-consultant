// src/app/(admin)/dashboard/page.tsx
"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

// Import schema từ file data-table.tsx
import { schema } from "@/components/data-table" // Đảm bảo đường dẫn đúng

// Import dữ liệu từ data.json
import rawData from "./data.json" // <-- Quan trọng: File data.json này phải có cấu trúc mới

export default function Page() {
  const typedData = React.useMemo(() => {
    try {
      // Dòng này sẽ hoạt động ổn khi rawData có cấu trúc đúng
      return schema.array().parse(rawData);
    } catch (error) {
      console.error("Error parsing data.json with Zod schema:", error);
      return [];
    }
  }, []);

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
              <SectionCards />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
              {/* Truyền dữ liệu đã được xác thực vào DataTable */}
              <DataTable data={typedData} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

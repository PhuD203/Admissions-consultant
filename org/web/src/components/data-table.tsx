"use client"

import * as React from "react"
import Search from "./search"
import { useCallback } from "react"
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  ColumnDef,
  ColumnFiltersState,
  Row,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  CheckCircle2Icon,
  ChevronDownIcon, // Giữ lại icon này
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ColumnsIcon,
  GripVerticalIcon,
  LoaderIcon,
  MoreVerticalIcon,
  PlusIcon,
  TrendingUpIcon,
} from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { toast } from "sonner"
import { z } from "zod"

import { useIsMobile } from "@/hooks/use-mobile"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup, // Thêm để lọc trạng thái
  DropdownMenuRadioItem // Thêm để lọc trạng thái
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

// Cập nhật schema để khớp với cấu trúc JSON của bạn
export const schema = z.object({
  student_id: z.number(),
  student_name: z.string(),
  email: z.string().email().nullable(), // Đã thêm .nullable()
  phone_number: z.string(),
  zalo_phone: z.string().nullable(),
  link_facebook: z.string().url().nullable(),
  date_of_birth: z.string(),
  current_education_level: z.string(),
  other_education_level_description: z.string().nullable(),
  high_school_name: z.string().nullable(), // Đã thêm .nullable()
  city: z.string(),
  source: z.string(),
  other_source_description: z.string().nullable(),
  notification_consent: z.string(),
  other_notification_consent_description: z.string().nullable(),
  current_status: z.string(),
  status_change_date: z.string(),
  registration_date: z.string().nullable(),
  student_created_at: z.string(),
  student_updated_at: z.string(),
  assigned_counselor_name: z.string(),
  assigned_counselor_email: z.string().email(),
  assigned_counselor_type: z.string(),
  interested_courses_details: z.string().nullable(),
  enrolled_courses_details: z.string().nullable(),
  student_status_history: z.string().nullable(),
  last_consultation_date: z.string().nullable(),
  last_consultation_duration_minutes: z.number().nullable(),
  last_consultation_notes: z.string().nullable(),
  last_consultation_type: z.string().nullable(),
  last_consultation_status: z.string().nullable(),
  last_consultation_counselor_name: z.string().nullable(),
})

// Create a separate component for the drag handle
function DragHandle({ id }: { id: number }) {
  const { attributes, listeners } = useSortable({
    id,
  })

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="size-7 text-muted-foreground hover:bg-transparent"
    >
      <GripVerticalIcon className="size-3 text-muted-foreground" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  )
}

const columns: ColumnDef<z.infer<typeof schema>>[] = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.student_id} />,
  },
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "student_name", // Thay đổi từ "header"
    header: "Tên Sinh Viên", // Thay đổi tiêu đề
    cell: ({ row }) => {
      return <TableCellViewer item={row.original} />
    },
    enableHiding: false,
  },
  {
    accessorKey: "current_education_level", // Thay đổi từ "type"
    header: "Trình Độ Học Vấn", // Thay đổi tiêu đề
    cell: ({ row }) => (
      <div className="w-32">
        <Badge variant="outline" className="px-1.5 text-muted-foreground">
          {row.original.current_education_level}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "current_status", // Thay đổi từ "status"
    header: ({ column }) => { // Sửa đổi header để có nút lọc
      const currentFilter = column.getFilterValue() as string | undefined;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="-ml-3 h-8 data-[state=open]:bg-accent"
            >
              <span>Trạng Thái</span>
              <ChevronDownIcon className="ml-2 size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[150px]">
            <DropdownMenuRadioGroup
              value={currentFilter}
              onValueChange={(value) => {
                column.setFilterValue(value === "all" ? undefined : value);
              }}
            >
              <DropdownMenuRadioItem value="all">Tất cả</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="Lead">Lead</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="Engaging">Engaging</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="Enrolled">Enrolled</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="Dropped Out">Dropped Out</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="Completed">Completed</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className="flex gap-1 px-1.5 text-muted-foreground [&_svg]:size-3"
      >
        {row.original.current_status === "Engaging" ? (
          <CheckCircle2Icon className="text-green-500 dark:text-green-400" />
        ) : (
          <LoaderIcon />
        )}
        {row.original.current_status}
      </Badge>
    ),
  },
  {
    accessorKey: "phone_number",
    header: "Số Điện Thoại",
    cell: ({ row }) => row.original.phone_number,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => row.original.email,
  },
  {
    accessorKey: "last_consultation_date",
    header: "Ngày tư vấn gần nhất",
    cell: ({ row }) => row.original.last_consultation_date,
  },
  {
    accessorKey: "source",
    header: "Nguồn",
    cell: ({ row }) => row.original.source,
  },
  {
    accessorKey: "assigned_counselor_name",
    header: "Người Tư Vấn",
    cell: ({ row }) => {
      const isAssigned = row.original.assigned_counselor_name !== "" && row.original.assigned_counselor_name !== null

      if (isAssigned) {
        return row.original.assigned_counselor_name
      }

      return (
        <>
          <Label htmlFor={`${row.original.student_id}-counselor`} className="sr-only">
            Người Tư Vấn
          </Label>
          <Select>
            <SelectTrigger
              className="h-8 w-40"
              id={`${row.original.student_id}-counselor`}
            >
              <SelectValue placeholder="Gán người tư vấn" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="Trần Thị B">Trần Thị B</SelectItem>
              <SelectItem value="Lê Văn C">Lê Văn C</SelectItem>
            </SelectContent>
          </Select>
        </>
      )
    },
  },
  {
    id: "actions",
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
            size="icon"
          >
            <MoreVerticalIcon />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem>Chỉnh Sửa</DropdownMenuItem>
          <DropdownMenuItem>Tạo Bản Sao</DropdownMenuItem>
          <DropdownMenuItem>Thêm vào Yêu Thích</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Xóa</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

function DraggableRow({ row }: { row: Row<z.infer<typeof schema>> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.student_id,
  })

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )
}

export function DataTable({
                            data: initialData,
                          }: {
  data: z.infer<typeof schema>[]
}) {
  const [data, setData] = React.useState(() => initialData)
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const sortableId = React.useId()
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ student_id }) => student_id) || [],
    [data]
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.student_id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  const handleSearch = useCallback((searchTerm: string) => {
    // Đặt bộ lọc cho cột 'hoTen'
    // Lưu ý: React-table sẽ tự động xử lý việc này và không gây re-render nếu giá trị không thay đổi
    // Tuy nhiên, nếu bạn muốn clear filter khi searchTerm rỗng, bạn có thể kiểm tra:
    if (searchTerm) {
      table.getColumn('student_name')?.setFilterValue(searchTerm);
    } else {
      table.getColumn('student_name')?.setFilterValue(undefined); // Xóa bộ lọc khi input rỗng
    }
  }, [table]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id)
        const newIndex = dataIds.indexOf(over.id)
        return arrayMove(data, oldIndex, newIndex)
      })
    }
  }

  return (
    <Tabs
      defaultValue="overview"
      className="flex w-full flex-col justify-start gap-6"
    >
      <div className="flex items-center justify-between px-4 lg:px-6">
        <Label htmlFor="view-selector" className="sr-only">
          View
        </Label>
        <Select defaultValue="overview">
          <SelectTrigger
            className="@4xl/main:hidden flex w-fit"
            id="view-selector"
          >
            <SelectValue placeholder="Select a view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="overview">Tổng Quan</SelectItem>

          </SelectContent>
        </Select>
        <TabsList className="@4xl/main:flex hidden">
          <TabsTrigger value="overview">Tổng Quan</TabsTrigger>



        </TabsList>
        <div className="flex items-center gap-2">
          <Search onSearch={handleSearch} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <ColumnsIcon />
                <span className="hidden lg:inline">Tùy Chỉnh Cột</span>
                <span className="lg:hidden">Cột</span>
                <ChevronDownIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm">
            <PlusIcon />
            <span className="hidden lg:inline">Thêm Sinh Viên</span>
          </Button>
        </div>
      </div>
      <TabsContent
        value="overview"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-muted">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {table.getRowModel().rows?.length ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      Không có kết quả.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} trong{" "}
            {table.getFilteredRowModel().rows.length} hàng đã chọn.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Số hàng mỗi trang
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value))
                }}
              >
                <SelectTrigger className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Trang {table.getState().pagination.pageIndex + 1} của{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Đi đến trang đầu tiên</span>
                <ChevronsLeftIcon />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Đi đến trang trước</span>
                <ChevronLeftIcon />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Đi đến trang tiếp theo</span>
                <ChevronRightIcon />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Đi đến trang cuối cùng</span>
                <ChevronsRightIcon />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>



    </Tabs>
  )
}

const chartData = [
  { month: "Tháng 1", visitors: 186 },
  { month: "Tháng 2", visitors: 305 },
  { month: "Tháng 3", visitors: 237 },
  { month: "Tháng 4", visitors: 73 },
  { month: "Tháng 5", visitors: 209 },
  { month: "Tháng 6", visitors: 214 },
]

const chartConfig = {
  visitors: {
    label: "Lượt truy cập",
    color: "var(--primary)",
  },
} satisfies ChartConfig

function TableCellViewer({ item }: { item: z.infer<typeof schema> }) {
  const isMobile = useIsMobile()

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="link" className="w-fit px-0 text-left text-foreground">
          {item.student_name}
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="flex flex-col w-[1200px]">
        <SheetHeader className="gap-1">
          <SheetTitle>{item.student_name}</SheetTitle>
          <SheetDescription>
            Thông tin chi tiết về sinh viên này.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto py-4 text-sm">
          {!isMobile && (
            <>
              <ChartContainer config={chartConfig}>
                <AreaChart
                  accessibilityLayer
                  data={chartData}
                  margin={{
                    left: 0,
                    right: 10,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 3)}
                    hide
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Area
                    dataKey="visitors"
                    type="natural"
                    fill="var(--color-visitors)"
                    fillOpacity={0.4}
                    stroke="var(--color-visitors)"
                    stackId="a"
                  />
                </AreaChart>
              </ChartContainer>
              <Separator />
              <div className="grid gap-2 px-4">
                <div className="flex gap-2 font-medium leading-none">
                  Trạng thái hiện tại: {item.current_status}
                  {item.current_status === "Engaging" ? (
                    <CheckCircle2Icon className="size-4 text-green-500 dark:text-green-400" />
                  ) : (
                    <LoaderIcon />
                  )}
                </div>
                <div className="text-muted-foreground">
                  Đây là một đoạn văn bản mô tả chung về sinh viên và trạng thái của họ.
                </div>
              </div>
              <Separator />
            </>
          )}
          <form className="flex flex-col gap-4 px-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor="student_name">Tên Sinh Viên</Label>
              <Input id="student_name" defaultValue={item.student_name} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="current_education_level">Trình Độ Học Vấn</Label>
                <Select defaultValue={item.current_education_level}>
                  <SelectTrigger id="current_education_level" className="w-full">
                    <SelectValue placeholder="Chọn trình độ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="THPT">THPT</SelectItem>
                    <SelectItem value="Cao Đẳng">Cao Đẳng</SelectItem>
                    <SelectItem value="Đại Học">Đại Học</SelectItem>
                    <SelectItem value="Sau Đại Học">Sau Đại Học</SelectItem>
                    <SelectItem value="Khác">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="current_status">Trạng Thái</Label>
                <Select defaultValue={item.current_status}>
                  <SelectTrigger id="current_status" className="w-full">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lead">Lead</SelectItem>
                    <SelectItem value="Engaging">Engaging</SelectItem>
                    <SelectItem value="Enrolled">Enrolled</SelectItem>
                    <SelectItem value="Dropped Out">Dropped Out</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="phone_number">Số Điện Thoại</Label>
                <Input id="phone_number" defaultValue={item.phone_number} />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="email">Email</Label>
                <Input id="email" defaultValue={item.email ?? ""} />
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="assigned_counselor_name">Người Tư Vấn Được Gán</Label>
              <Select defaultValue={item.assigned_counselor_name}>
                <SelectTrigger id="assigned_counselor_name" className="w-full">
                  <SelectValue placeholder="Chọn người tư vấn" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Trần Thị B">Trần Thị B</SelectItem>
                  <SelectItem value="Lê Văn C">Lê Văn C</SelectItem>
                  <SelectItem value="Phạm Thu D">Phạm Thu D</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-3">
              <Label htmlFor="last_consultation_notes">Ghi Chú Tư Vấn Cuối Cùng</Label>
              <Input
                id="last_consultation_notes"
                defaultValue={item.last_consultation_notes || ""}
              />
            </div>
          </form>
        </div>
        <SheetFooter className="mt-auto flex gap-2 sm:flex-col sm:space-x-0">
          <Button className="w-full">Lưu Thay Đổi</Button>
          <SheetClose asChild>
            <Button variant="outline" className="w-full">
              Hoàn Tất
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

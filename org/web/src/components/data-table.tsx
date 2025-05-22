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
  SortableContext, // Corrected import source
  arrayMove,
  useSortable, // Corrected import source
  verticalListSortingStrategy,
} from "@dnd-kit/sortable" // Changed from @dnd-kit/utilities
import { CSS } from "@dnd-kit/utilities" // This is still correct for CSS utility
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
  ChevronDownIcon,
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
  CalendarIcon
} from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { toast } from "sonner"
import { z } from "zod"
import { format } from "date-fns" // Dùng date-fns để format ngày tháng

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
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

// Cập nhật schema để khớp với cấu trúc JSON của bạn
export const schema = z.object({
  student_id: z.number(),
  student_name: z.string(),
  email: z.string().email().nullable(),
  phone_number: z.string(),
  zalo_phone: z.string().nullable(),
  link_facebook: z.string().url().nullable(),
  date_of_birth: z.string().nullable(), // Nullable vì có thể không có giá trị
  current_education_level: z.string(),
  other_education_level_description: z.string().nullable(),
  high_school_name: z.string().nullable(),
  city: z.string(),
  source: z.string(),
  notification_consent: z.string(),
  current_status: z.string(),
  status_change_date: z.string().nullable(), // Nullable
  registration_date: z.string().nullable(),
  student_created_at: z.string(),
  student_updated_at: z.string(),
  assigned_counselor_name: z.string(),
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
    accessorKey: "student_name",
    header: "Tên Sinh Viên",
    cell: ({ row }) => {
      return <TableCellViewer item={row.original} />
    },
    enableHiding: false,
  },
  {
    accessorKey: "current_education_level",
    header: "Trình Độ Học Vấn",
    cell: ({ row }) => (
      <div className="w-32">
        <Badge variant="outline" className="px-1.5 text-muted-foreground">
          {row.original.current_education_level}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "current_status",
    header: ({ column }) => {
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
    if (searchTerm) {
      table.getColumn('student_name')?.setFilterValue(searchTerm);
    } else {
      table.getColumn('student_name')?.setFilterValue(undefined);
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

// Utility function to filter out null, undefined, or empty string values
const filterEmptyValues = (obj: Record<string, any>) => {
  const filtered: Record<string, any> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      // Bỏ qua null, undefined, và chuỗi rỗng
      if (value !== null && value !== "" && value !== undefined) {
        filtered[key] = value;
      }
    }
  }
  return filtered;
};

function TableCellViewer({ item }: { item: z.infer<typeof schema> }) {
  const isMobile = useIsMobile();

  // Initialize states with item data
  const [studentName, setStudentName] = React.useState(item.student_name);
  const [email, setEmail] = React.useState(item.email ?? "");
  const [phoneNumber, setPhoneNumber] = React.useState(item.phone_number);
  const [zaloPhone, setZaloPhone] = React.useState(item.zalo_phone ?? "");
  const [linkFacebook, setLinkFacebook] = React.useState(item.link_facebook ?? "");
  const [dateOfBirth, setDateOfBirth] = React.useState<Date | undefined>(
    item.date_of_birth ? new Date(item.date_of_birth) : undefined
  );
  const [currentEducationLevel, setCurrentEducationLevel] = React.useState(item.current_education_level);
  const [otherEducationLevelDescription, setOtherEducationLevelDescription] = React.useState(item.other_education_level_description ?? "");
  const [highSchoolName, setHighSchoolName] = React.useState(item.high_school_name ?? "");
  const [city, setCity] = React.useState(item.city);
  const [source, setSource] = React.useState(item.source);
  const [notificationConsent, setNotificationConsent] = React.useState(item.notification_consent);
  const [currentStatus, setCurrentStatus] = React.useState(item.current_status);
  const [statusChangeDate, setStatusChangeDate] = React.useState<Date | undefined>(
    item.status_change_date ? new Date(item.status_change_date) : undefined
  );
  const [registrationDate, setRegistrationDate] = React.useState<Date | undefined>(
    item.registration_date ? new Date(item.registration_date) : undefined
  );
  // student_created_at and student_updated_at are read-only, no need for useState if not modified by user
  const [assignedCounselorName, setAssignedCounselorName] = React.useState(item.assigned_counselor_name);
  const [assignedCounselorType, setAssignedCounselorType] = React.useState(item.assigned_counselor_type);
  const [interestedCoursesDetails, setInterestedCoursesDetails] = React.useState(item.interested_courses_details ?? "");
  const [enrolledCoursesDetails, setEnrolledCoursesDetails] = React.useState(item.enrolled_courses_details ?? "");
  const [studentStatusHistoryNotes, setStudentStatusHistoryNotes] = React.useState(item.student_status_history ?? ""); // Renamed to avoid confusion with the table name
  const [lastConsultationDate, setLastConsultationDate] = React.useState<Date | undefined>(
    item.last_consultation_date ? new Date(item.last_consultation_date) : undefined
  );
  const [lastConsultationDurationMinutes, setLastConsultationDurationMinutes] = React.useState<number | string>(item.last_consultation_duration_minutes ?? "");
  const [lastConsultationNotes, setLastConsultationNotes] = React.useState(item.last_consultation_notes ?? "");
  const [lastConsultationType, setLastConsultationType] = React.useState(item.last_consultation_type ?? "");
  const [lastConsultationStatus, setLastConsultationStatus] = React.useState(item.last_consultation_status ?? "");
  const [lastConsultationCounselorName, setLastConsultationCounselorName] = React.useState(item.last_consultation_counselor_name ?? "");

  // UI states for expandable fields
  const [showStatusHistory, setShowStatusHistory] = React.useState(false);
  const [showInterestedCourses, setShowInterestedCourses] = React.useState(false);
  const [showEnrolledCourses, setShowEnrolledCourses] = React.useState(false);

  // Helper component for DatePicker
  const DatePickerField = ({ label, date, setDate, id, readOnly = false }: { label: string, date: Date | undefined, setDate: (d: Date | undefined) => void, id: string, readOnly?: boolean }) => (
    <div className="flex flex-col gap-3">
      <Label htmlFor={id}>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
            disabled={readOnly}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "yyyy-MM-dd") : <span>Chọn ngày</span>} {/* Format to YYYY-MM-DD */}
          </Button>
        </PopoverTrigger>
        {!readOnly && (
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        )}
      </Popover>
    </div>
  );

  // Helper component for expandable text content
  const ExpandableTextField = ({ label, content, id, show, setShow, onContentChange }: { label: string, content: string | null | undefined, id: string, show: boolean, setShow: (b: boolean) => void, onContentChange?: (value: string) => void }) => (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShow(!show)}
          type="button"
        >
          <ChevronDownIcon className={cn("size-4 transition-transform", show ? "rotate-180" : "rotate-0")} />
          <span className="sr-only">Toggle {label.toLowerCase()} visibility</span>
        </Button>
      </div>
      {show && (
        <div className="border rounded-md p-3 bg-muted/20">
          {onContentChange ? (
            <textarea
              id={id}
              className="w-full h-24 p-2 bg-transparent text-sm text-muted-foreground resize-y focus:outline-none"
              value={content ?? ""}
              onChange={(e) => onContentChange(e.target.value)}
              placeholder={`Nhập ${label.toLowerCase()}...`}
            />
          ) : (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {content ? content : <span className="italic">Không có thông tin.</span>}
            </p>
          )}
        </div>
      )}
    </div>
  );

  // Handle form submission
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent default form submission

    // --- 1. Dữ liệu cho bảng 'Students' ---
    // Bao gồm các trường trực tiếp thuộc về bảng Students.
    // 'id' được giữ lại để backend biết bản ghi nào cần cập nhật.
    const studentDataDraft: Record<string, any> = {
      id: item.student_id, // ID của sinh viên hiện có
      student_name: studentName,
      email: email,
      phone_number: phoneNumber,
      zalo_phone: zaloPhone,
      link_facebook: linkFacebook,
      date_of_birth: dateOfBirth ? format(dateOfBirth, "yyyy-MM-dd") : null,
      current_education_level: currentEducationLevel,
      other_education_level_description: otherEducationLevelDescription,
      high_school_name: highSchoolName,
      city: city,
      source: source,
      notification_consent: notificationConsent,
      current_status: currentStatus,
      assigned_counselor_name: assignedCounselorName, // Tên để backend lookup
      assigned_counselor_type: assignedCounselorType,
      status_change_date: statusChangeDate ? format(statusChangeDate, "yyyy-MM-dd HH:mm:ss") : null,
      registration_date: registrationDate ? format(registrationDate, "yyyy-MM-dd") : null,
      // student_created_at và student_updated_at thường được quản lý bởi DB, không gửi từ frontend
    };
    const studentData = filterEmptyValues(studentDataDraft);


    // --- 2. Dữ liệu cho bảng 'StudentStatusHistory' ---
    let studentStatusHistoryData: Record<string, any> | null = null;
    // Chỉ tạo bản ghi lịch sử nếu trạng thái hiện tại thay đổi hoặc có ghi chú lịch sử
    // Giả sử item.current_status là trạng thái ban đầu của sinh viên từ database
    // So sánh trạng thái mới với trạng thái ban đầu của item để xác định thay đổi
    if (currentStatus !== item.current_status || studentStatusHistoryNotes) {
      const statusHistoryDraft: Record<string, any> = {
        student_id: item.student_id,
        old_status: item.current_status, // Trạng thái cũ từ dữ liệu ban đầu
        new_status: currentStatus,
        change_date: statusChangeDate ? format(statusChangeDate, "yyyy-MM-dd HH:mm:ss") : format(new Date(), "yyyy-MM-dd HH:mm:ss"),
        notes: studentStatusHistoryNotes,
        // changed_by_user_id sẽ được thêm ở backend từ thông tin người dùng đăng nhập
      };
      studentStatusHistoryData = filterEmptyValues(statusHistoryDraft);
    }


    // --- 3. Dữ liệu cho bảng 'ConsultationSessions' ---
    let consultationSessionData: Record<string, any> | null = null;
    // Chỉ tạo bản ghi tư vấn nếu có bất kỳ thông tin tư vấn nào được điền
    if (lastConsultationDate || lastConsultationDurationMinutes || lastConsultationNotes || lastConsultationType || lastConsultationStatus || lastConsultationCounselorName) {
      const consultationDraft: Record<string, any> = {
        student_id: item.student_id,
        session_date: lastConsultationDate ? format(lastConsultationDate, "yyyy-MM-dd") : null,
        duration_minutes: lastConsultationDurationMinutes === "" ? null : Number(lastConsultationDurationMinutes),
        notes: lastConsultationNotes,
        session_type: lastConsultationType,
        session_status: lastConsultationStatus,
        counselor_name: lastConsultationCounselorName, // Tên để backend lookup
      };
      consultationSessionData = filterEmptyValues(consultationDraft);
    }


    // --- 4. Dữ liệu cho bảng 'Student_Interested_Courses' ---
    let interestedCoursesData: Record<string, any> | null = null;
    if (interestedCoursesDetails) {
      const courseNames = interestedCoursesDetails.split(',').map(name => name.trim()).filter(name => name !== '');
      if (courseNames.length > 0) {
        interestedCoursesData = {
          student_id: item.student_id,
          courses: courseNames, // Backend sẽ xử lý tìm/tạo course_id
          interest_date: format(new Date(), "yyyy-MM-dd"), // Hoặc một ngày cụ thể từ frontend
          notes: interestedCoursesDetails // Có thể dùng làm ghi chú chi tiết
        };
      }
    }


    // --- 5. Dữ liệu cho bảng 'StudentEnrollments' ---
    let enrolledCoursesData: Record<string, any> | null = null;
    if (enrolledCoursesDetails) {
      const courseNames = enrolledCoursesDetails.split(',').map(name => name.trim()).filter(name => name !== '');
      if (courseNames.length > 0) {
        const enrollmentDraft: Record<string, any> = {
          student_id: item.student_id,
          courses: courseNames, // Backend sẽ xử lý tìm/tạo course_id
          enrollment_date: registrationDate ? format(registrationDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
          // Thêm các trường khác như fee_paid, payment_status, counselor_id, consultation_session_id
          // nếu bạn có input cho chúng trên frontend. Nếu không, backend sẽ cần logic mặc định.
          // Ví dụ:
          // fee_paid: 0, // Cần giá trị thực
          // payment_status: 'Pending', // Cần giá trị thực
          // counselor_id: null, // Cần ID thực
          // consultation_session_id: null, // Cần ID thực
          notes: enrolledCoursesDetails // Có thể dùng làm ghi chú
        };
        enrolledCoursesData = filterEmptyValues(enrollmentDraft);
      }
    }

    // Gom tất cả các đối tượng dữ liệu đã lọc vào một payload duy nhất
    const finalDataPacket: Record<string, any> = {};

    // Chỉ thêm vào finalDataPacket nếu đối tượng con có dữ liệu
    // Đối với `student`, nếu là student_id mới (chưa có item.student_id) HOẶC có sự thay đổi
    // (kiểm tra Object.keys(studentData).length > 1 vì 'id' luôn có)
    if (Object.keys(studentData).length > 1 || !item.student_id) {
      finalDataPacket.student = studentData;
    }
    if (studentStatusHistoryData && Object.keys(studentStatusHistoryData).length > 0) {
      finalDataPacket.studentStatusHistory = studentStatusHistoryData;
    }
    if (consultationSessionData && Object.keys(consultationSessionData).length > 0) {
      finalDataPacket.consultationSession = consultationSessionData;
    }
    if (interestedCoursesData && Object.keys(interestedCoursesData).length > 0) {
      finalDataPacket.interestedCourses = interestedCoursesData;
    }
    if (enrolledCoursesData && Object.keys(enrolledCoursesData).length > 0) {
      finalDataPacket.enrolledCourses = enrolledCoursesData;
    }


    console.log("Dữ liệu đã được phân tách và sẵn sàng gửi về backend:");
    console.log(finalDataPacket);
    toast.success("Đã chuẩn bị dữ liệu. Kiểm tra console.log!");

    // Sau khi console.log và xác nhận dữ liệu, bạn có thể uncomment phần fetch API để gửi dữ liệu đi.
    // Dưới đây là ví dụ cách gửi toàn bộ packet đến một endpoint xử lý chung:
    /*
    fetch('/api/update-student-profile', { // Thay thế bằng endpoint API thực tế của bạn
      method: 'POST', // Hoặc 'PUT' nếu API của bạn tuân theo RESTful cho cập nhật
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${yourAuthToken}`, // Thêm token xác thực nếu có
      },
      body: JSON.stringify(finalDataPacket),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('Success:', data);
      toast.success("Cập nhật thành công!");
      // Bạn có thể cập nhật UI hoặc đóng sheet ở đây
      // Ví dụ: table.options.meta?.refetchData();
    })
    .catch((error) => {
      console.error('Error:', error);
      toast.error(`Cập nhật thất bại: ${error.message}`);
    });
    */
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="link" className="w-fit px-0 text-left text-foreground">
          {item.student_name}
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="flex flex-col w-[1200px] sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-5xl"> {/* Adjust width based on screen size */}
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
          <form className="flex flex-col gap-4 px-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-3">
              <Label htmlFor="student_id">Mã Sinh Viên</Label>
              <Input id="student_id" value={item.student_id} readOnly /> {/* Readonly, not part of mutable state */}
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="student_name">Tên Sinh Viên</Label>
              <Input id="student_name" value={studentName} onChange={(e) => setStudentName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="phone_number">Số Điện Thoại</Label>
                <Input id="phone_number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="zalo_phone">Số Zalo</Label>
                <Input id="zalo_phone" value={zaloPhone} onChange={(e) => setZaloPhone(e.target.value)} />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="link_facebook">Link Facebook</Label>
                <Input id="link_facebook" value={linkFacebook} onChange={(e) => setLinkFacebook(e.target.value)} />
              </div>
            </div>

            {/* Date of Birth */}
            <DatePickerField
              label="Ngày Sinh"
              id="date_of_birth"
              date={dateOfBirth}
              setDate={setDateOfBirth}
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="current_education_level">Trình Độ Học Vấn</Label>
                <Select value={currentEducationLevel} onValueChange={setCurrentEducationLevel}>
                  <SelectTrigger id="current_education_level" className="w-full">
                    <SelectValue placeholder="Chọn trình độ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="THPT">THPT</SelectItem>
                    <SelectItem value="SinhVien">Sinh Viên</SelectItem>
                    <SelectItem value="Other">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="other_education_level_description">Mô Tả Trình Độ Học Vấn Khác</Label>
              <Input id="other_education_level_description" value={otherEducationLevelDescription} onChange={(e) => setOtherEducationLevelDescription(e.target.value)} />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="high_school_name">Tên Trường Cấp 3</Label>
              <Input id="high_school_name" value={highSchoolName} onChange={(e) => setHighSchoolName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="city">Thành Phố</Label>
                <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="source">Nguồn</Label>
                <Select value={source} onValueChange={setSource}>
                  <SelectTrigger id="source" className="w-full">
                    <SelectValue placeholder="Chọn nguồn" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mail">Mail</SelectItem>
                    <SelectItem value="Fanpage">Fanpage</SelectItem>
                    <SelectItem value="Zalo">Zalo</SelectItem>
                    <SelectItem value="Website">Website</SelectItem>
                    <SelectItem value="Friend">Bạn bè</SelectItem>
                    <SelectItem value="SMS">SMS</SelectItem>
                    <SelectItem value="Banderole">Banderole</SelectItem>
                    <SelectItem value="Poster">Poster</SelectItem>
                    <SelectItem value="Brochure">Brochure</SelectItem>
                    <SelectItem value="Google">Google</SelectItem>
                    <SelectItem value="Brand">Thương hiệu</SelectItem>
                    <SelectItem value="Event">Sự kiện</SelectItem>
                    <SelectItem value="Other">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="notification_consent">Đồng Ý Nhận Thông Báo</Label>
              <Select value={notificationConsent} onValueChange={setNotificationConsent}>
                <SelectTrigger id="notification_consent" className="w-full">
                  <SelectValue placeholder="Đồng ý/Không đồng ý" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Agree">Đồng ý</SelectItem>
                  <SelectItem value="Disagree">Không đồng ý</SelectItem>
                  <SelectItem value="Other">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="current_status">Trạng Thái Hiện Tại</Label>
                <Select value={currentStatus} onValueChange={setCurrentStatus}>
                  <SelectTrigger id="current_status" className="w-full">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lead">Lead</SelectItem>
                    <SelectItem value="Engaging">Engaging</SelectItem>
                    <SelectItem value="Registered">Đã đăng ký</SelectItem>
                    <SelectItem value="Dropped Out">Bỏ học</SelectItem>
                    <SelectItem value="Archived">Lưu trữ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status Change Date */}
              <DatePickerField
                label="Ngày Thay Đổi Trạng Thái"
                id="status_change_date"
                date={statusChangeDate}
                setDate={setStatusChangeDate}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {/* Registration Date */}
              <DatePickerField
                label="Ngày Đăng Ký"
                id="registration_date"
                date={registrationDate}
                setDate={setRegistrationDate}
              />

              {/* Student Created At */}
              <DatePickerField
                label="Ngày Tạo Sinh Viên"
                id="student_created_at"
                date={item.student_created_at ? new Date(item.student_created_at) : undefined}
                setDate={() => {}} // Readonly
                readOnly={true}
              />
            </div>
            {/* Student Updated At */}
            <DatePickerField
              label="Ngày Cập Nhật Sinh Viên"
              id="student_updated_at"
              date={item.student_updated_at ? new Date(item.student_updated_at) : undefined}
              setDate={() => {}} // Readonly
              readOnly={true}
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="assigned_counselor_name">Tên Người Tư Vấn Được Gán</Label>
                <Select value={assignedCounselorName} onValueChange={setAssignedCounselorName}>
                  <SelectTrigger id="assigned_counselor_name" className="w-full">
                    <SelectValue placeholder="Chọn người tư vấn" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Trần Thị B">Trần Thị B</SelectItem>
                    <SelectItem value="Lê Văn C">Lê Văn C</SelectItem>
                    <SelectItem value="Phạm Thu D">Phạm Thu D</SelectItem>
                    {/* Add more counselors dynamically from your Users table if available */}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="assigned_counselor_type">Loại Người Tư Vấn Được Gán</Label>
                <Input id="assigned_counselor_type" value={assignedCounselorType} onChange={(e) => setAssignedCounselorType(e.target.value)} />
              </div>
            </div>

            {/* Expandable interested_courses_details */}
            <ExpandableTextField
              label="Chi Tiết Khóa Học Quan Tâm"
              id="interested_courses_details"
              content={interestedCoursesDetails}
              show={showInterestedCourses}
              setShow={setShowInterestedCourses}
              onContentChange={setInterestedCoursesDetails}
            />

            {/* Expandable enrolled_courses_details */}
            <ExpandableTextField
              label="Chi Tiết Khóa Học Đã Đăng Ký"
              id="enrolled_courses_details"
              content={enrolledCoursesDetails}
              show={showEnrolledCourses}
              setShow={setShowEnrolledCourses}
              onContentChange={setEnrolledCoursesDetails}
            />

            {/* Lịch sử trạng thái sinh viên */}
            <ExpandableTextField
              label="Ghi chú Lịch Sử Trạng Thái Sinh Viên"
              id="student_status_history"
              content={studentStatusHistoryNotes}
              show={showStatusHistory}
              setShow={setShowStatusHistory}
              onContentChange={setStudentStatusHistoryNotes} // This will allow editing history notes
            />

            {/* Last Consultation Date */}
            <DatePickerField
              label="Ngày Tư Vấn Cuối Cùng"
              id="last_consultation_date"
              date={lastConsultationDate}
              setDate={setLastConsultationDate}
            />

            <div className="flex flex-col gap-3">
              <Label htmlFor="last_consultation_duration_minutes">Thời Lượng Tư Vấn Cuối Cùng (phút)</Label>
              <Input
                id="last_consultation_duration_minutes"
                value={lastConsultationDurationMinutes}
                onChange={(e) => setLastConsultationDurationMinutes(e.target.value)}
                type="number"
              />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="last_consultation_notes">Ghi Chú Tư Vấn Cuối Cùng</Label>
              <Input id="last_consultation_notes" value={lastConsultationNotes} onChange={(e) => setLastConsultationNotes(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="last_consultation_type">Loại Tư Vấn Cuối Cùng</Label>
                <Input id="last_consultation_type" value={lastConsultationType} onChange={(e) => setLastConsultationType(e.target.value)} />
              </div>
              {/* Trạng thái Tư Vấn Cuối Cùng - Select */}
              <div className="flex flex-col gap-3">
                <Label htmlFor="last_consultation_status">Trạng Thái Tư Vấn Cuối Cùng</Label>
                <Select
                  value={lastConsultationStatus}
                  onValueChange={setLastConsultationStatus}
                >
                  <SelectTrigger id="last_consultation_status" className="w-full">
                    <SelectValue placeholder="Chọn trạng thái tư vấn" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Scheduled">Đã lên lịch</SelectItem>
                    <SelectItem value="Completed">Hoàn thành</SelectItem>
                    <SelectItem value="Canceled">Đã hủy</SelectItem>
                    <SelectItem value="No Show">Không có mặt</SelectItem>
                    {/* Add more consultation statuses if needed */}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="last_consultation_counselor_name">Tên Người Tư Vấn Cuối Cùng</Label>
              <Input id="last_consultation_counselor_name" value={lastConsultationCounselorName} onChange={(e) => setLastConsultationCounselorName(e.target.value)} />
            </div>
            <SheetFooter className="mt-auto flex gap-2 sm:flex-col sm:space-x-0">
              <Button type="submit" className="w-full">Lưu Thay Đổi</Button> {/* Type submit */}
              <SheetClose asChild>
                <Button type="button" variant="outline" className="w-full"> {/* Type button to prevent submission */}
                  Hoàn Tất
                </Button>
              </SheetClose>
            </SheetFooter>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}

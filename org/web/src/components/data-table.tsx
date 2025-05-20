"use client"

import * as React from "react"
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
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleCheckFilled,
  IconDotsVertical,
  IconGripVertical,
  IconLayoutColumns,
  IconLoader,
  IconPlus,
  IconTrendingUp,
} from "@tabler/icons-react"
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
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
  IconHourglassLow, // Ví dụ icon cho "Đang theo dõi"
  IconSend, // Ví dụ icon cho "Mới"
  IconUserPlus // Ví dụ icon cho "Đăng ký học"
} from "@tabler/icons-react"

// Trong file định nghĩa schema của bạn (ví dụ: data-table.tsx hoặc riêng biệt)
export const schema = z.object({
  id: z.number(),
  hoTen: z.string(),
  lienHe: z.string(),
  khoaHoc: z.string(),
  kenh: z.string(),
  trangThai: z.enum([
    "Mới",
    "Đã tư vấn",
    "Đang theo dõi",
    "Đăng ký học",
    "Đã đăng ký",
    "Đang tư vấn",
    "Tiềm năng",
    "Hủy"
  ]),
});

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
      className="text-muted-foreground size-7 hover:bg-transparent"
    >
      <IconGripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  )
}
const ALL_TRANG_THAI = [
  "Mới",
  "Đã tư vấn",
  "Đang theo dõi",
  "Đăng ký học",
  "Đã đăng ký",
  "Đang tư vấn",
  "Tiềm năng",
  "Hủy",
];

const columns: ColumnDef<z.infer<typeof schema>>[] = [
  // Giữ cột drag và select nếu bạn muốn chức năng này
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
    enableSorting: false,
    enableHiding: false,
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
  // Cột "Họ tên"
  {
    accessorKey: "hoTen",
    header: "Họ tên",
    cell: ({ row }) => <div className="font-medium">{row.original.hoTen}</div>,
    enableHiding: false,
  },
  // Cột "Liên hệ"
  {
    accessorKey: "lienHe",
    header: "Liên hệ",
    cell: ({ row }) => <div className="font-medium">{row.original.lienHe}</div>,
  },
  // Cột "Khóa học"
  {
    accessorKey: "khoaHoc",
    header: "Khóa học",
    cell: ({ row }) => <div className="text-muted-foreground">{row.original.khoaHoc}</div>,
  },
  // Cột "Kênh"
  {
    accessorKey: "kenh",
    header: "Kênh",
    cell: ({ row }) => (
      <Badge variant="secondary" className="px-1.5">
        {row.original.kenh}
      </Badge>
    ),
  },
  {
    accessorKey: "trangThai",
    header: ({ column }) => { // Thêm { column } vào đây để truy cập các hàm của cột
      const filterValue = column.getFilterValue();
      const currentTrangThai = typeof filterValue === 'string' ? filterValue : '';

      return (
        <div className="flex items-center">
          <span>Trạng thái</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="ml-2 h-8 w-8 p-0"
                aria-label="Filter status"
              >
                <IconChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem
                onClick={() => column.setFilterValue(undefined)} // Xóa bộ lọc
                className={!currentTrangThai ? "font-bold" : ""}
              >
                Tất cả
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {ALL_TRANG_THAI.map((status) => (
                <DropdownMenuItem
                  key={status}
                  onClick={() => column.setFilterValue(status)}
                  className={currentTrangThai === status ? "font-bold" : ""}
                >
                  {status}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
    cell: ({ row }) => {
      const trangThai = row.original.trangThai;
      let variant: "outline" | "secondary" | "destructive" | "success" | "info" | "warning";
      let icon = null;
      let textColor = "text-muted-foreground";

      switch (trangThai) {
        case "Mới":
          variant = "secondary";
          icon = <IconSend className="mr-1 size-3.5" />;
          textColor = "text-blue-600 dark:text-blue-400";
          break;
        case "Đã tư vấn":
          variant = "outline";
          icon = <IconCircleCheckFilled className="fill-blue-500 dark:fill-blue-400 mr-1 size-3.5" />;
          textColor = "text-blue-500 dark:text-blue-400";
          break;
        case "Đang theo dõi":
          variant = "outline";
          icon = <IconHourglassLow className="text-orange-500 dark:text-orange-400 mr-1 size-3.5" />;
          textColor = "text-orange-500 dark:text-orange-400";
          break;
        case "Đăng ký học":
          variant = "outline";
          icon = <IconUserPlus className="text-green-500 dark:text-green-400 mr-1 size-3.5" />;
          textColor = "text-green-500 dark:text-green-400";
          break;
        case "Đã đăng ký":
          variant = "outline";
          icon = <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400 mr-1 size-3.5" />;
          textColor = "text-green-500 dark:text-green-400";
          break;
        case "Đang tư vấn":
          variant = "outline";
          icon = <IconLoader className="mr-1 size-3.5" />;
          textColor = "text-yellow-600 dark:text-yellow-400";
          break;
        case "Tiềm năng":
          variant = "secondary";
          icon = <IconTrendingUp className="text-purple-500 dark:text-purple-400 mr-1 size-3.5" />;
          textColor = "text-purple-500 dark:text-purple-400";
          break;
        case "Hủy":
          variant = "destructive";
          icon = null;
          textColor = "text-red-500 dark:text-red-400";
          break;
        default:
          variant = "outline";
          icon = null;
          textColor = "text-muted-foreground";
          break;
      }

      return (
        <Badge variant={variant} className={`${textColor} px-1.5`}>
          {icon}
          {trangThai}
        </Badge>
      );
    },
    enableColumnFilter: true, // Quan trọng: bật bộ lọc cho cột này
  },
  // Cột "Hành động"
  {
    id: "actions", // ID duy nhất cho cột hành động
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
            size="icon"
          >
            <IconDotsVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem>Edit</DropdownMenuItem> {/* Giữ lại để tích hợp chức năng chỉnh sửa */}
          <DropdownMenuItem>Make a copy</DropdownMenuItem>
          <DropdownMenuItem>Favorite</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

function DraggableRow({ row }: { row: Row<z.infer<typeof schema>> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
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
    () => data?.map(({ id }) => id) || [],
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
    getRowId: (row) => row.id.toString(),
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
      defaultValue="outline"
      className="w-full flex-col justify-start gap-6"
    >
      <div className="flex items-center justify-between px-4 lg:px-6">
        <Label htmlFor="view-selector" className="sr-only">
          View
        </Label>
        <Select defaultValue="outline">
          <SelectTrigger
            className="flex w-fit @4xl/main:hidden"
            size="sm"
            id="view-selector"
          >
            <SelectValue placeholder="Select a view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="outline">Outline</SelectItem>
            <SelectItem value="past-performance">Past Performance</SelectItem>
            <SelectItem value="key-personnel">Key Personnel</SelectItem>
            <SelectItem value="focus-documents">Focus Documents</SelectItem>
          </SelectContent>
        </Select>
        <TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex">
          <TabsTrigger value="outline">Outline</TabsTrigger>
          <TabsTrigger value="past-performance">
            Past Performance <Badge variant="secondary">3</Badge>
          </TabsTrigger>
          <TabsTrigger value="key-personnel">
            Key Personnel <Badge variant="secondary">2</Badge>
          </TabsTrigger>
          <TabsTrigger value="focus-documents">Focus Documents</TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <IconLayoutColumns />
                <span className="hidden lg:inline">Customize Columns</span>
                <span className="lg:hidden">Columns</span>
                <IconChevronDown />
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
            <IconPlus />
            <span className="hidden lg:inline">Add Section</span>
          </Button>
        </div>
      </div>
      <TabsContent
        value="outline"
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
              <TableHeader className="bg-muted sticky top-0 z-10">
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
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value))
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
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
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent
        value="past-performance"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent value="key-personnel" className="flex flex-col px-4 lg:px-6">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent
        value="focus-documents"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
    </Tabs>
  )
}

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
]

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--primary)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--primary)",
  },
} satisfies ChartConfig

function TableCellViewer({ item, onSave }: { // Thêm onSave prop
  item: z.infer<typeof schema>;
  onSave: (updatedItem: z.infer<typeof schema>) => Promise<void>;
}) {
  const isMobile = useIsMobile();
  const [formData, setFormData] = React.useState<z.infer<typeof schema>>(item);
  const [isSaving, setIsSaving] = React.useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: keyof z.infer<typeof schema>) => (value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
      toast.success(`'${formData.hoTen}' saved successfully.`); // Cập nhật toast message
    } catch (error) {
      toast.error(`Failed to save '${formData.hoTen}'.`); // Cập nhật toast message
      console.error('Error saving document:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button variant="link" className="text-foreground w-fit px-0 text-left">
          {item.hoTen} {/* Hiển thị Họ tên */}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{item.hoTen}</DrawerTitle> {/* Hiển thị Họ tên */}
          <DrawerDescription>
            Chi tiết và chỉnh sửa thông tin học viên
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          {!isMobile && (
            <>
              {/* Có thể xóa phần biểu đồ và mô tả nếu không cần */}
              {/* ... ChartContainer và content liên quan ... */}
              <Separator />
              <div className="grid gap-2">
                <div className="flex gap-2 leading-none font-medium">
                  Thông tin chi tiết về học viên {item.hoTen}.
                </div>
              </div>
              <Separator />
            </>
          )}
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {/* Các trường input mới */}
            <div className="flex flex-col gap-3">
              <Label htmlFor="hoTen">Họ tên</Label>
              <Input
                id="hoTen"
                value={formData.hoTen}
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="lienHe">Liên hệ</Label>
              <Input
                id="lienHe"
                value={formData.lienHe}
                onChange={handleChange}
                placeholder="Email hoặc Số điện thoại"
              />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="khoaHoc">Khóa học</Label>
              <Input
                id="khoaHoc"
                value={formData.khoaHoc}
                onChange={handleChange}
                placeholder="Khóa học đang tư vấn/đăng ký"
              />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="kenh">Kênh</Label>
              <Select
                value={formData.kenh}
                onValueChange={handleSelectChange('kenh')}
              >
                <SelectTrigger id="kenh" className="w-full">
                  <SelectValue placeholder="Chọn kênh" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Facebook Ads">Facebook Ads</SelectItem>
                  <SelectItem value="Zalo">Zalo</SelectItem>
                  <SelectItem value="Website">Website</SelectItem>
                  <SelectItem value="Giới thiệu">Giới thiệu</SelectItem>
                  {/* Thêm các kênh khác nếu cần */}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="trangThai">Trạng thái</Label>
              <Select
                value={formData.trangThai}
                onValueChange={handleSelectChange('trangThai')}
              >
                <SelectTrigger id="trangThai" className="w-full">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Đang tư vấn">Đang tư vấn</SelectItem>
                  <SelectItem value="Đã đăng ký">Đã đăng ký</SelectItem>
                  <SelectItem value="Tiềm năng">Tiềm năng</SelectItem>
                  <SelectItem value="Hủy">Hủy</SelectItem>
                  {/* Thêm các trạng thái khác nếu cần */}
                </SelectContent>
              </Select>
            </div>
            <DrawerFooter>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Đang lưu...' : 'Lưu'}
              </Button>
              <DrawerClose asChild>
                <Button variant="outline">Đóng</Button>
              </DrawerClose>
            </DrawerFooter>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

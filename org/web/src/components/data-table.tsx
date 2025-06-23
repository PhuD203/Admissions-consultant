'use client';

import * as React from 'react';
import Search from './search';
import { useCallback } from 'react';
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
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  SortableContext, // Corrected import source
  arrayMove,
  useSortable, // Corrected import source
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'; // Changed from @dnd-kit/utilities
import { CSS } from '@dnd-kit/utilities'; // This is still correct for CSS utility
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
} from '@tanstack/react-table';
import {
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
  CalendarIcon,
  XCircleIcon,
  MessageSquareIcon,
  ArchiveIcon,
  CheckCircle2Icon,
} from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import { toast } from 'sonner';
import { z } from 'zod';
import { format } from 'date-fns'; // Dùng date-fns để format ngày tháng

import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

import {
  consultingDataSchema,
  ConsultingTableRow,
  Metadata,
} from '@/lib/schema/consulting-data-schema';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface DataTableProps {
  data: ConsultingTableRow[];
  metadata: Metadata;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (limit: number) => void;
  onSearch: (searchTerm: string) => void;
  onUpdate: (
    studentId: number,
    updateData: Partial<ConsultingTableRow>
  ) => Promise<void>;
  currentSearchTerm: string;
  isSearching: boolean;
  initialSearchTerm?: string;
  isUpdating?: boolean;
}

const columnNamesMap: {
  current_education_level: string;
  current_status: string;
  phone_number: string;
  email: string;
  last_consultation_date: string;
  source: string;
  assigned_counselor_name: string;
  [key: string]: string;
} = {
  current_education_level: 'Trình độ học vấn',
  current_status: 'Trạng thái',
  phone_number: 'Số điện thoại',
  email: 'Email',
  last_consultation_date: 'Ngày tư vấn gần nhất',
  source: 'Nguồn',
  assigned_counselor_name: 'Người tư vấn',
};
// Create a separate component for the drag handle
function DragHandle({ id }: { id: number }) {
  const { attributes, listeners } = useSortable({
    id,
  });

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
  );
}
const getDaysDifference = (date1: any, date2: any) => {
  const diffTime = Math.abs(date2 - date1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const isConsultationOverdue = (
  lastConsultationDate: any,
  daysThreshold = 2
) => {
  if (!lastConsultationDate) return false;

  const today = new Date();
  const consultationDate = new Date(lastConsultationDate);
  return getDaysDifference(today, consultationDate) >= daysThreshold;
};

const columns: ColumnDef<ConsultingTableRow>[] = [
  {
    id: 'drag',
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.student_id} />,
  },
  {
    id: 'select',
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
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
    accessorKey: 'student_name',
    header: 'Tên Sinh Viên',
    cell: ({ row, table }) => {
      const onUpdate = (table.options.meta as any)?.onUpdate;
      return <TableCellViewer item={row.original} onUpdate={onUpdate} />;
    },
    enableHiding: false,
  },
  {
    accessorKey: 'current_education_level',
    header: 'Trình Độ Học Vấn',
    cell: ({ row }) => (
      <div className="w-32">
        <Badge variant="outline" className="px-1.5 text-muted-foreground">
          {row.original.current_education_level}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: 'current_status',
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
                column.setFilterValue(value === 'all' ? undefined : value);
              }}
            >
              <DropdownMenuRadioItem value="all">Tất cả</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="Tiềm năng">
                Tiềm năng
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="Đang tương tác">
                Đang tư vấn
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="Đã đăng ký">
                Đã đăng ký
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="Thôi học">
                Đã ngừng
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="Lưu trữ">
                Đã lưu trữ
              </DropdownMenuRadioItem>
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
        {row.original.current_status === 'Đã đăng ký' ? (
          <CheckCircle2Icon className="text-green-500 dark:text-green-400" />
        ) : row.original.current_status === 'Thôi học' ? (
          <XCircleIcon className="text-red-500 dark:text-red-400" />
        ) : row.original.current_status === 'Đang tương tác' ? (
          <MessageSquareIcon className="text-yellow-500 dark:text-yellow-400" />
        ) : row.original.current_status === 'Lưu trữ' ? (
          <ArchiveIcon className="text-gray-500 dark:text-gray-400" />
        ) : (
          <LoaderIcon />
        )}
        {row.original.current_status}
      </Badge>
    ),
  },
  {
    accessorKey: 'phone_number',
    header: 'Số Điện Thoại',
    cell: ({ row }) => row.original.phone_number,
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => row.original.email,
  },
  {
    accessorKey: 'last_consultation_date',
    header: 'Ngày tư vấn gần nhất',
    cell: ({ row }) => {
      // Hàm kiểm tra ngày tư vấn gần nhất
      const isConsultationOverdue = (lastConsultationDate: any) => {
        if (!lastConsultationDate) return false;

        const today = new Date();
        const consultationDate = new Date(lastConsultationDate);
        const diffTime = Math.abs(today.getTime() - consultationDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays >= 2;
      };

      const isOverdue = isConsultationOverdue(
        row.original.last_consultation_date
      );
      const formattedDate = row.original.last_consultation_date || 'Chưa có';

      return (
        <span
          className={`${
            isOverdue
              ? 'text-red-600 font-medium bg-red-50 px-2 py-1 rounded dark:text-red-400 dark:bg-red-950'
              : 'text-foreground'
          }`}
        >
          {formattedDate}
        </span>
      );
    },
  },
  {
    accessorKey: 'source',
    header: 'Nguồn',
    cell: ({ row }) => row.original.source,
  },
  {
    accessorKey: 'assigned_counselor_name',
    header: 'Người Tư Vấn',
    cell: ({ row }) => {
      const isAssigned =
        row.original.assigned_counselor_name !== '' &&
        row.original.assigned_counselor_name !== null;

      if (isAssigned) {
        return row.original.assigned_counselor_name;
      }

      return (
        <>
          <Label
            htmlFor={`${row.original.student_id}-counselor`}
            className="sr-only"
          >
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
      );
    },
  },
  {
    id: 'actions',
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
];

function DraggableRow({ row }: { row: Row<ConsultingTableRow> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.student_id,
  });

  return (
    <TableRow
      data-state={row.getIsSelected() && 'selected'}
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
  );
}

export function DataTable({
  data: serverData, // Đổi tên initialData thành serverData để rõ ràng hơn
  metadata, // Nhận metadata từ props
  onPageChange,
  onItemsPerPageChange,
  onUpdate,
  onSearch,
  currentSearchTerm,
  initialSearchTerm,
  isUpdating = false,
}: DataTableProps) {
  // Bỏ state `data` cục bộ nếu bạn không cần drag-and-drop cho dữ liệu phân trang
  // Nếu bạn VẪN cần drag-and-drop, bạn phải suy nghĩ lại logic hoặc chỉ cho phép drag-drop trên dữ liệu của trang hiện tại.
  // Hiện tại, để đơn giản hóa pagination, tôi sẽ giả định bạn không cần drag-drop cho server-side pagination.
  // Nếu vẫn cần Drag & Drop, bạn cần chỉnh sửa `setData` để nó thay đổi dữ liệu từ serverData (không phải local state).
  // Tuy nhiên, việc thực hiện kéo thả trên dữ liệu được phân trang từ server rất phức tạp.
  // Đối với trường hợp này, tôi sẽ tập trung vào việc sửa phân trang trước.
  const [data, setData] = React.useState(serverData); // Giữ lại nếu drag-drop là bắt buộc và bạn chỉ drag trên trang hiện tại

  // Sử dụng useEffect để cập nhật `data` khi `serverData` thay đổi (tức là khi API trả về trang mới)
  React.useEffect(() => {
    setData(serverData);
  }, [serverData]);

  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const handleStudentUpdate = async (
    studentId: number,
    updateData: Partial<ConsultingTableRow>
  ) => {
    try {
      await onUpdate(studentId, updateData);
      toast.success('Cập nhật thông tin sinh viên thành công');
    } catch (error) {
      console.error('Lỗi khi cập nhật sinh viên:', error);
      toast.error('Có lỗi xảy ra khi cập nhật thông tin');
    }
  };

  // Bỏ quản lý pagination state ở đây. React Table sẽ điều khiển nó thông qua props.
  // const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10, });

  const sortableId = React.useId();
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ student_id }) => student_id) || [],
    [data]
  );

  const table = useReactTable({
    data: serverData, // Sử dụng dữ liệu trực tiếp từ props (đã được fetch theo trang)
    columns,
    meta: {
      onUpdate: onUpdate, // Truyền prop onUpdate vào meta
    },
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      // Bỏ pagination state ở đây và chuyển sang external control
      pagination: {
        pageIndex: metadata.page - 1, // pageIndex là 0-based
        pageSize: metadata.limit,
      },
    },
    // Bỏ onPaginationChange
    // onPaginationChange: setPagination,

    // Cần cung cấp manual pagination flags
    manualPagination: true, // RẤT QUAN TRỌNG: Nói với React Table rằng pagination được quản lý thủ công (bởi server)
    pageCount: metadata.lastPage, // RẤT QUAN TRỌNG: Cung cấp tổng số trang từ metadata

    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    // Bỏ getPaginationRowModel() - vì pagination là manual
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getRowId: (row) => row.student_id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
  });

  const handleSearch = useCallback(
    (searchTerm: string) => {
      // Logic tìm kiếm này vẫn là client-side. Nếu bạn muốn tìm kiếm server-side,
      // bạn sẽ cần truyền searchTerm lên page.tsx và sau đó vào useConsultingList.
      if (searchTerm) {
        table.getColumn('student_name')?.setFilterValue(searchTerm);
      } else {
        table.getColumn('student_name')?.setFilterValue(undefined);
      }
    },
    [table]
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setData((data) => {
        // Lưu ý: Dragging sẽ chỉ hoạt động trên dữ liệu của trang hiện tại.
        // Việc reorder và gửi lên server phức tạp hơn nếu bạn muốn thay đổi thứ tự toàn bộ.
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);
        return arrayMove(data, oldIndex, newIndex);
      });
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
          <Search onSearch={onSearch} initialSearchTerm={currentSearchTerm} />
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
                    typeof column.accessorFn !== 'undefined' &&
                    column.getCanHide()
                )
                .map((column) => {
                  // Lấy tên tiếng Việt từ columnNamesMap, nếu không có thì dùng column.id
                  const displayColumnName =
                    columnNamesMap[column.id] || column.id;

                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize" // Bạn có thể bỏ className="capitalize" nếu muốn giữ nguyên chữ cái đầu của tên tiếng Việt
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {displayColumnName} {/* Sử dụng tên tiếng Việt ở đây */}
                    </DropdownMenuCheckboxItem>
                  );
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
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {table.getRowModel().rows?.length ? (
                  <SortableContext
                    items={dataIds} // dataIds bây giờ lấy từ id của Row objects
                    strategy={verticalListSortingStrategy}
                  >
                    {/* SỬA LỖI TẠI ĐÂY: Dùng table.getRowModel().rows để map */}
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
        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-4">
          <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} trong{' '}
            {table.getFilteredRowModel().rows.length} hàng đã chọn.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Số hàng mỗi trang
              </Label>
              <Select
                value={`${metadata.limit}`} // Sử dụng metadata.limit
                onValueChange={(value) => {
                  if (onItemsPerPageChange) {
                    // KIỂM TRA SỰ TỒN TẠI TRƯỚC KHI GỌI
                    onItemsPerPageChange(Number(value)); // Gọi hàm prop
                  }
                }}
              >
                <SelectTrigger className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={metadata.limit} // Sử dụng metadata.limit
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
              Trang {metadata.page} của {metadata.lastPage}{' '}
              {/* Sử dụng metadata.page và metadata.lastPage */}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => onPageChange(1)} // Gọi hàm prop, trang 1
                disabled={metadata.page <= 1} // Vô hiệu hóa nếu đang ở trang đầu
              >
                <span className="sr-only">Đi đến trang đầu tiên</span>
                <ChevronsLeftIcon />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => onPageChange(metadata.page - 1)} // Gọi hàm prop, trang trước
                disabled={metadata.page <= 1} // Vô hiệu hóa nếu đang ở trang đầu
              >
                <span className="sr-only">Đi đến trang trước</span>
                <ChevronLeftIcon />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => onPageChange(metadata.page + 1)} // Gọi hàm prop, trang tiếp theo
                disabled={metadata.page >= metadata.lastPage} // Vô hiệu hóa nếu đang ở trang cuối
              >
                <span className="sr-only">Đi đến trang tiếp theo</span>
                <ChevronRightIcon />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => onPageChange(metadata.lastPage)} // Gọi hàm prop, trang cuối
                disabled={metadata.page >= metadata.lastPage} // Vô hiệu hóa nếu đang ở trang cuối
              >
                <span className="sr-only">Đi đến trang cuối cùng</span>
                <ChevronsRightIcon />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}

const chartData = [
  { month: 'Tháng 1', visitors: 186 },
  { month: 'Tháng 2', visitors: 305 },
  { month: 'Tháng 3', visitors: 237 },
  { month: 'Tháng 4', visitors: 73 },
  { month: 'Tháng 5', visitors: 209 },
  { month: 'Tháng 6', visitors: 214 },
];

const chartConfig = {
  visitors: {
    label: 'Lượt truy cập',
    color: 'var(--primary)',
  },
} satisfies ChartConfig;

// Utility function to filter out null, undefined, or empty string values
const filterEmptyValues = (obj: Record<string, any>) => {
  const filtered: Record<string, any> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      // Bỏ qua null, undefined, và chuỗi rỗng
      if (value !== null && value !== '' && value !== undefined) {
        filtered[key] = value;
      }
    }
  }
  return filtered;
};

function TableCellViewer({
  item,
  onUpdate,
}: {
  item: z.infer<typeof consultingDataSchema>;
  onUpdate?: (
    studentId: number,
    updateData: Partial<ConsultingTableRow>
  ) => Promise<void>;
}) {
  const isMobile = useIsMobile();

  // Initialize states with item data
  const [initialData, setInitialData] = React.useState(item);

  React.useEffect(() => {
    setInitialData(item);
    resetForm(item);
  }, [item]);
  const [studentName, setStudentName] = React.useState(item.student_name);
  const [email, setEmail] = React.useState(item.email ?? '');
  const [phoneNumber, setPhoneNumber] = React.useState(item.phone_number);
  const [zaloPhone, setZaloPhone] = React.useState(item.zalo_phone ?? '');
  const [linkFacebook, setLinkFacebook] = React.useState(
    item.link_facebook ?? ''
  );
  const [dateOfBirth, setDateOfBirth] = React.useState<Date | undefined>(
    item.date_of_birth ? new Date(item.date_of_birth) : undefined
  );
  const [currentEducationLevel, setCurrentEducationLevel] = React.useState(
    item.current_education_level
  );
  const [otherEducationLevelDescription, setOtherEducationLevelDescription] =
    React.useState(item.other_education_level_description ?? '');
  const [highSchoolName, setHighSchoolName] = React.useState(
    item.high_school_name ?? ''
  );
  const [city, setCity] = React.useState(item.city);
  const [source, setSource] = React.useState(item.source);
  const [notificationConsent, setNotificationConsent] = React.useState(
    item.notification_consent
  );
  const [currentStatus, setCurrentStatus] = React.useState(item.current_status);
  const [statusChangeDate, setStatusChangeDate] = React.useState<
    Date | undefined
  >(item.status_change_date ? new Date(item.status_change_date) : undefined);
  const [registrationDate, setRegistrationDate] = React.useState<
    Date | undefined
  >(item.registration_date ? new Date(item.registration_date) : undefined);
  // student_created_at and student_updated_at are read-only, no need for useState if not modified by user
  const [assignedCounselorName, setAssignedCounselorName] = React.useState(
    item.assigned_counselor_name
  );
  const [assignedCounselorType, setAssignedCounselorType] = React.useState(
    item.assigned_counselor_type
  );
  const [interestedCoursesDetails, setInterestedCoursesDetails] =
    React.useState(item.interested_courses_details ?? '');
  const [enrolledCoursesDetails, setEnrolledCoursesDetails] = React.useState(
    item.enrolled_courses_details ?? ''
  );
  const [studentStatusHistoryNotes, setStudentStatusHistoryNotes] =
    React.useState(item.student_status_history ?? ''); // Renamed to avoid confusion with the table name
  const [lastConsultationDate, setLastConsultationDate] = React.useState<
    Date | undefined
  >(
    item.last_consultation_date
      ? new Date(item.last_consultation_date)
      : undefined
  );
  const [lastConsultationDurationMinutes, setLastConsultationDurationMinutes] =
    React.useState<number | string>(
      item.last_consultation_duration_minutes ?? ''
    );
  const [lastConsultationNotes, setLastConsultationNotes] = React.useState(
    item.last_consultation_notes ?? ''
  );
  const [lastConsultationType, setLastConsultationType] = React.useState(
    item.last_consultation_type ?? ''
  );
  const [lastConsultationStatus, setLastConsultationStatus] = React.useState(
    item.last_consultation_status ?? ''
  );
  const [lastConsultationCounselorName, setLastConsultationCounselorName] =
    React.useState(item.last_consultation_counselor_name ?? '');

  // UI states for expandable fields
  const [showStatusHistory, setShowStatusHistory] = React.useState(false);
  const [showInterestedCourses, setShowInterestedCourses] =
    React.useState(false);
  const [showEnrolledCourses, setShowEnrolledCourses] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const sheetCloseRef = React.useRef<HTMLButtonElement>(null);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
  };
  const resetForm = (data: z.infer<typeof consultingDataSchema>) => {
    setStudentName(data.student_name);
    setEmail(data.email ?? '');
    setPhoneNumber(data.phone_number);
    setZaloPhone(data.zalo_phone ?? '');
    setLinkFacebook(data.link_facebook ?? '');
    setDateOfBirth(
      data.date_of_birth ? new Date(data.date_of_birth) : undefined
    );
    setCurrentEducationLevel(data.current_education_level);
    setOtherEducationLevelDescription(
      data.other_education_level_description ?? ''
    );
    setHighSchoolName(data.high_school_name ?? '');
    setCity(data.city);
    setSource(data.source);
    setNotificationConsent(data.notification_consent);
    setCurrentStatus(data.current_status);
    setStatusChangeDate(
      data.status_change_date ? new Date(data.status_change_date) : undefined
    );
    setRegistrationDate(
      data.registration_date ? new Date(data.registration_date) : undefined
    );
    setAssignedCounselorName(data.assigned_counselor_name);
    setAssignedCounselorType(data.assigned_counselor_type);
    setInterestedCoursesDetails(data.interested_courses_details ?? '');
    setEnrolledCoursesDetails(data.enrolled_courses_details ?? '');
    setStudentStatusHistoryNotes(data.student_status_history ?? '');
    setLastConsultationDate(
      data.last_consultation_date
        ? new Date(data.last_consultation_date)
        : undefined
    );
    setLastConsultationDurationMinutes(
      data.last_consultation_duration_minutes ?? ''
    );
    setLastConsultationNotes(data.last_consultation_notes ?? '');
    setLastConsultationType(data.last_consultation_type ?? '');
    setLastConsultationStatus(data.last_consultation_status ?? '');
    setLastConsultationCounselorName(
      data.last_consultation_counselor_name ?? ''
    );
  };

  const handleCancel = () => {
    resetForm(initialData);
  };

  // Helper component for DatePicker
  const HybridDatePickerField = ({
    label,
    date,
    setDate,
    id,
    readOnly = false,
  }: {
    label: string;
    date: Date | undefined;
    setDate: (d: Date | undefined) => void;
    id: string;
    readOnly?: boolean;
  }) => {
    const formatDateForInput = (date: Date | undefined) => {
      if (!date) return '';
      return format(date, 'yyyy-MM-dd');
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      console.log(`Date input changed for ${id}:`, value);

      if (value) {
        try {
          const newDate = new Date(value);
          setDate(newDate);
        } catch (error) {
          console.error('Error parsing date:', error);
        }
      } else {
        setDate(undefined);
      }
    };

    const handleCalendarSelect = (selectedDate: Date | undefined) => {
      console.log(`Calendar date selected for ${id}:`, selectedDate);
      setDate(selectedDate);
    };

    return (
      <div className="flex flex-col gap-3">
        <Label htmlFor={id}>{label}</Label>
        <div className="flex gap-2">
          {/* Native date input */}
          <Input
            id={id}
            type="date"
            value={formatDateForInput(date)}
            onChange={handleInputChange}
            readOnly={readOnly}
            className={cn('flex-1', readOnly && 'bg-muted cursor-not-allowed')}
          />

          {/* Calendar button */}
          {!readOnly && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  type="button"
                >
                  <CalendarIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 z-[9999]"
                style={{ pointerEvents: 'auto' }}
                align="end"
                side="top"
                sideOffset={4}
              >
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(selectedDate) => {
                    console.log('Selected date:', selectedDate); // Thêm dòng này để debug
                    setDate(selectedDate);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
    );
  };

  // Helper component for expandable text content
  const ExpandableTextField = ({
    label,
    content,
    id,
    show,
    setShow,
    onContentChange,
    readOnly = false,
  }: {
    label: string;
    content: string | null | undefined;
    id: string;
    show: boolean;
    setShow: (b: boolean) => void;
    onContentChange?: (value: string) => void;
    readOnly?: boolean;
  }) => (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShow(!show)}
          type="button"
        >
          <ChevronDownIcon
            className={cn(
              'size-4 transition-transform',
              show ? 'rotate-180' : 'rotate-0'
            )}
          />
          <span className="sr-only">
            Toggle {label.toLowerCase()} visibility
          </span>
        </Button>
      </div>
      {show && (
        <div className="border rounded-md p-3 bg-muted/20">
          {onContentChange && !readOnly ? (
            <textarea
              id={id}
              className="w-full h-24 p-2 bg-transparent text-sm text-muted-foreground resize-y focus:outline-none"
              value={content ?? ''}
              onChange={(e) => onContentChange(e.target.value)}
              placeholder={`Nhập ${label.toLowerCase()}...`}
            />
          ) : (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {content ? (
                content
              ) : (
                <span className="italic">Không có thông tin.</span>
              )}
            </p>
          )}
        </div>
      )}
    </div>
  );

  const getBackendStatus = (status: string): string => {
    switch (status) {
      case 'Tiềm năng':
        return 'Lead';
      case 'Đang tương tác':
        return 'Engaging';
      case 'Đã đăng ký':
        return 'Registered';
      case 'Thôi học':
        return 'Dropped_Out';
      case 'Lưu trữ':
        return 'Archived';
      default:
        console.error(`Trạng thái không hợp lệ: ${status}`);
        throw new Error(`Trạng thái không hợp lệ: ${status}`);
    }
  };

  const getBackendConsultType = (status: string): string => {
    switch (status) {
      case 'Cuộc gọi điện thoại':
      case 'Phone_Call':
        return 'Phone_Call';
      case 'Họp trực tuyến':
      case 'Online_Meeting':
        return 'Online_Meeting';
      case 'Trực tiếp':
      case 'In_Person':
        return 'In_Person';
      case 'Email':
        return 'Email';
      case 'Trò chuyện':
      case 'Chat':
        return 'Chat';
      default:
        console.error(`Trạng thái không hợp lệ: ${status}`);
        throw new Error(`Trạng thái không hợp lệ: ${status}`);
    }
  };
  const getBackendConsultSession = (status: string): string => {
    switch (status) {
      case 'Đã lên lịch':
      case 'Scheduled':
        return 'Scheduled';
      case 'Hoàn thành':
      case 'Completed':
        return 'Completed';
      case 'Đã hủy':
      case 'Canceled':
        return 'Canceled';
      case 'Không tham dự':
      case 'No_Show':
        return 'No_Show';
      default:
        console.error(`Trạng thái không hợp lệ: ${status}`);
        throw new Error(`Trạng thái không hợp lệ: ${status}`);
    }
  };

  const getBackendNotifi = (status: string): string => {
    switch (status) {
      case 'Đồng ý':
      case 'Agree':
        return 'Agree';
      case 'Không đồng ý':
      case 'Disagree':
        return 'Disagree';
      case 'Khác':
      case 'Other':
        return 'Other';
      default:
        console.error(`Trạng thái không hợp lệ: ${status}`);
        throw new Error(`Trạng thái không hợp lệ: ${status}`);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdate) {
      console.error('Missing onUpdate function');
      toast.error('Không thể cập nhật: Thiếu hàm xử lý cập nhật');
      return;
    }

    if (!item.student_id) {
      console.error('Missing student ID');
      toast.error('Không thể cập nhật: Thiếu ID sinh viên');
      return;
    }

    // Chuyển đổi các giá trị frontend sang backend trước khi tạo updateData
    let backendCurrentEducationLevel,
      backendSource,
      backendNotificationConsent,
      backendCurrentStatus,
      backendLastConsultationType,
      backendLastConsultationStatus;

    try {
      backendCurrentEducationLevel = currentEducationLevel;
      backendSource = source;
      backendNotificationConsent = notificationConsent
        ? getBackendNotifi(notificationConsent)
        : undefined;
      backendCurrentStatus = currentStatus
        ? getBackendStatus(currentStatus)
        : undefined;
      backendLastConsultationType = lastConsultationType
        ? getBackendConsultType(lastConsultationType)
        : undefined;
      backendLastConsultationStatus = lastConsultationStatus
        ? getBackendConsultSession(lastConsultationStatus)
        : undefined;
    } catch (error: any) {
      toast.error(error.message);
      return;
    }

    // Chuyển đổi các giá trị null thành undefined để phù hợp với kiểu Partial<ConsultingTableRow>
    const updateData: Partial<ConsultingTableRow> = {
      student_name: studentName,
      email: email || undefined,
      phone_number: phoneNumber,
      zalo_phone: zaloPhone || undefined,
      link_facebook: linkFacebook || undefined,
      date_of_birth: dateOfBirth
        ? format(dateOfBirth, 'yyyy-MM-dd')
        : undefined,
      current_education_level: backendCurrentEducationLevel,
      other_education_level_description:
        otherEducationLevelDescription || undefined,
      high_school_name: highSchoolName || undefined,
      city: city,
      source: backendSource,
      notification_consent: backendNotificationConsent,
      current_status: backendCurrentStatus,
      status_change_date: statusChangeDate
        ? format(statusChangeDate, 'yyyy-MM-dd')
        : undefined,
      registration_date: registrationDate
        ? format(registrationDate, 'yyyy-MM-dd')
        : undefined,
      assigned_counselor_name: assignedCounselorName || undefined,
      assigned_counselor_type: assignedCounselorType || undefined,
      interested_courses_details: interestedCoursesDetails || undefined,
      enrolled_courses_details: enrolledCoursesDetails || undefined,
      student_status_history: studentStatusHistoryNotes || undefined,
      last_consultation_date: lastConsultationDate
        ? format(lastConsultationDate, 'yyyy-MM-dd')
        : undefined,
      last_consultation_duration_minutes: lastConsultationDurationMinutes
        ? Number(lastConsultationDurationMinutes)
        : undefined,
      last_consultation_notes: lastConsultationNotes || undefined,
      last_consultation_type: backendLastConsultationType,
      last_consultation_status: backendLastConsultationStatus,
      last_consultation_counselor_name:
        lastConsultationCounselorName || undefined,
    };

    // Xử lý trường hợp thay đổi status
    if (currentStatus !== item.current_status) {
      updateData.status_change_date = new Date().toISOString();
    }

    const changedData: Partial<ConsultingTableRow> = {};

    for (const key in updateData) {
      if (Object.prototype.hasOwnProperty.call(updateData, key)) {
        const typedKey = key as keyof ConsultingTableRow;
        const value = updateData[typedKey];

        if (value !== initialData[typedKey]) {
          (changedData as any)[typedKey] = value === null ? undefined : value;
        }
      }
    }

    // Kiểm tra nếu không có gì thay đổi
    if (Object.keys(changedData).length === 0) {
      toast.info('Không có thay đổi nào để cập nhật');
      return;
    }

    try {
      await onUpdate(item.student_id, changedData);
      if (sheetCloseRef.current) {
        sheetCloseRef.current.click();
      }
      setIsSuccess(true);

      setTimeout(() => setIsSuccess(false), 3000);
    } catch (error) {
      console.error('Lỗi khi cập nhật:', error);
    }
  };

  return (
    <>
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button
            variant="link"
            className="w-fit px-0 text-left text-foreground"
            onClick={() => setIsSheetOpen(true)}
          >
            {item.student_name}
          </Button>
        </SheetTrigger>

        <SheetContent
          side="right"
          // Đảm bảo SheetContent có chiều rộng phù hợp và có thể cuộn
          className="flex flex-col w-[1200px] sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-5xl overflow-y-auto" // THÊM overflow-y-auto VÀO ĐÂY
        >
          <SheetHeader className="gap-1">
            <SheetTitle>{item.student_name}</SheetTitle>
            <SheetDescription>
              Thông tin chi tiết về sinh viên này.
            </SheetDescription>
          </SheetHeader>

          {/* Đổi div này để nó không tự cuộn nữa, vì SheetContent đã cuộn */}
          <div className="flex flex-col gap-4 py-4 text-sm">
            {' '}
            {/* BỎ overflow-y-auto Ở ĐÂY */}
            {!isMobile && (
              <>
                {/* ChartContainer và các thành phần khác */}
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
                    Trạng thái hiện tại: {currentStatus}{' '}
                    {currentStatus === 'Đã đăng ký' ? (
                      <CheckCircle2Icon className="size-4 text-green-500 dark:text-green-400" />
                    ) : currentStatus === 'Thôi học' ? (
                      <XCircleIcon className="size-4 text-red-500 dark:text-red-400" />
                    ) : currentStatus === 'Đang tương tác' ? (
                      <MessageSquareIcon className="size-4 text-yellow-500 dark:text-yellow-400" />
                    ) : currentStatus === 'Lưu trữ' ? (
                      <ArchiveIcon className="size-4 text-gray-500 dark:text-gray-400" />
                    ) : (
                      <LoaderIcon className="size-4" />
                    )}
                  </div>
                  <div className="text-muted-foreground">
                    Đây là một đoạn văn bản mô tả chung về sinh viên và trạng
                    thái của họ.
                  </div>
                </div>
                <Separator />
              </>
            )}
            {/* Form của bạn */}
            <form className="flex flex-col gap-4 px-4" onSubmit={handleSubmit}>
              {/* Mã Sinh Viên - READ ONLY */}
              <div className="flex flex-col gap-3">
                <Label htmlFor="student_id">Mã Sinh Viên</Label>
                <Input
                  id="student_id"
                  value={item.student_id}
                  readOnly
                  className="bg-muted cursor-not-allowed"
                />
              </div>

              <div className="flex flex-col gap-3">
                <Label htmlFor="student_name">Tên Sinh Viên</Label>
                <Input
                  id="student_name"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <Label htmlFor="phone_number">Số Điện Thoại</Label>
                  <Input
                    id="phone_number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-3">
                  <Label htmlFor="zalo_phone">Số Zalo</Label>
                  <Input
                    id="zalo_phone"
                    value={zaloPhone}
                    onChange={(e) => setZaloPhone(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <Label htmlFor="link_facebook">Link Facebook</Label>
                  <Input
                    id="link_facebook"
                    value={linkFacebook}
                    onChange={(e) => setLinkFacebook(e.target.value)}
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <HybridDatePickerField
                label="Ngày Sinh"
                id="date_of_birth"
                date={dateOfBirth}
                setDate={setDateOfBirth}
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-3">
                  <Label htmlFor="current_education_level">
                    Trình Độ Học Vấn
                  </Label>
                  <Select
                    value={currentEducationLevel || ''}
                    onValueChange={setCurrentEducationLevel}
                  >
                    <SelectTrigger
                      id="current_education_level"
                      className="w-full"
                    >
                      <SelectValue placeholder="Chọn trình độ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="THPT">THPT</SelectItem>
                      <SelectItem value="Sinh viên">Sinh viên</SelectItem>
                      <SelectItem value="Khác">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Label htmlFor="other_education_level_description">
                  Mô Tả Trình Độ Học Vấn Khác
                </Label>
                <Input
                  id="other_education_level_description"
                  value={otherEducationLevelDescription}
                  onChange={(e) =>
                    setOtherEducationLevelDescription(e.target.value)
                  }
                />
              </div>

              <div className="flex flex-col gap-3">
                <Label htmlFor="high_school_name">Tên Trường Cấp 3</Label>
                <Input
                  id="high_school_name"
                  value={highSchoolName}
                  onChange={(e) => setHighSchoolName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-3">
                  <Label htmlFor="city">Thành Phố</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
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
                <Label htmlFor="notification_consent">
                  Đồng Ý Nhận Thông Báo
                </Label>
                <Select
                  value={notificationConsent}
                  onValueChange={setNotificationConsent}
                >
                  <SelectTrigger id="notification_consent" className="w-full">
                    <SelectValue placeholder="Đồng ý/Không đồng ý" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Đồng ý">Đồng ý</SelectItem>
                    <SelectItem value="Không đồng ý">Không đồng ý</SelectItem>
                    <SelectItem value="Khác">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* TRẠNG THÁI HIỆN TẠI - CÓ THỂ CHỈNH SỬA */}
                <div className="flex flex-col gap-3">
                  <Label htmlFor="current_status">Trạng Thái Hiện Tại</Label>
                  <Select
                    value={currentStatus}
                    onValueChange={setCurrentStatus}
                  >
                    <SelectTrigger id="current_status" className="w-full">
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* ĐỊNH NGHĨA CÁC GIÁ TRỊ TRẠNG THÁI */}
                      <SelectItem value="Tiềm năng">Tiềm năng</SelectItem>
                      <SelectItem value="Đang tương tác">
                        Đang tương tác
                      </SelectItem>
                      <SelectItem value="Đã đăng ký">Đã đăng ký</SelectItem>
                      <SelectItem value="Thôi học">Đã ngừng</SelectItem>
                      <SelectItem value="Đã lưu trữ">Đã lưu trữ</SelectItem>
                      {/* Thêm các trạng thái khác nếu cần */}
                    </SelectContent>
                  </Select>
                </div>

                {/* Ngày Thay Đổi Trạng Thái - READ ONLY */}
                <HybridDatePickerField
                  label="Ngày Thay Đổi Trạng Thái"
                  id="status_change_date"
                  date={statusChangeDate}
                  setDate={setStatusChangeDate}
                  readOnly={true} // Vẫn giữ là Readonly
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Registration Date */}
                <HybridDatePickerField
                  label="Ngày Đăng Ký"
                  id="registration_date"
                  date={registrationDate}
                  setDate={setRegistrationDate}
                />

                {/* Student Created At */}
                <HybridDatePickerField
                  label="Ngày Tạo Sinh Viên"
                  id="student_created_at"
                  date={
                    item.student_created_at
                      ? new Date(item.student_created_at)
                      : undefined
                  }
                  setDate={() => {}} // Readonly
                  readOnly={true}
                />
              </div>

              {/* Student Updated At */}
              <HybridDatePickerField
                label="Ngày Cập Nhật Sinh Viên"
                id="student_updated_at"
                date={
                  item.student_updated_at
                    ? new Date(item.student_updated_at)
                    : undefined
                }
                setDate={() => {}} // Readonly
                readOnly={true}
              />

              <div className="grid grid-cols-2 gap-4">
                {/* Tên Người Tư Vấn Được Gán - READ ONLY */}
                <div className="flex flex-col gap-3">
                  <Label htmlFor="assigned_counselor_name">
                    Tên Người Tư Vấn Được Gán
                  </Label>
                  <Input
                    id="assigned_counselor_name"
                    value={assignedCounselorName}
                    readOnly
                    className="bg-muted cursor-not-allowed"
                  />
                </div>

                {/* Loại Người Tư Vấn Được Gán - READ ONLY */}
                <div className="flex flex-col gap-3">
                  <Label htmlFor="assigned_counselor_type">
                    Loại Người Tư Vấn Được Gán
                  </Label>
                  <Input
                    id="assigned_counselor_type"
                    value={assignedCounselorType}
                    readOnly
                    className="bg-muted cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Chi Tiết Khóa Học Quan Tâm - READ ONLY */}
              <ExpandableTextField
                label="Chi Tiết Khóa Học Quan Tâm"
                id="interested_courses_details"
                content={interestedCoursesDetails}
                show={showInterestedCourses}
                setShow={setShowInterestedCourses}
                readOnly={true}
              />

              {/* Chi Tiết Khóa Học Đã Đăng Ký - READ ONLY */}
              <ExpandableTextField
                label="Chi Tiết Khóa Học Đã Đăng Ký"
                id="enrolled_courses_details"
                content={enrolledCoursesDetails}
                show={showEnrolledCourses}
                setShow={setShowEnrolledCourses}
                readOnly={true}
              />

              {/* Lịch sử trạng thái sinh viên - EDITABLE */}
              <ExpandableTextField
                label="Ghi chú Lịch Sử Trạng Thái Sinh Viên"
                id="student_status_history"
                content={studentStatusHistoryNotes}
                show={showStatusHistory}
                setShow={setShowStatusHistory}
                onContentChange={setStudentStatusHistoryNotes}
              />

              {/* Last Consultation Date */}
              <HybridDatePickerField
                label="Ngày Tư Vấn Cuối Cùng"
                id="last_consultation_date"
                date={lastConsultationDate}
                setDate={setLastConsultationDate}
              />

              <div className="flex flex-col gap-3">
                <Label htmlFor="last_consultation_duration_minutes">
                  Thời Lượng Tư Vấn Cuối Cùng (phút)
                </Label>
                <Input
                  id="last_consultation_duration_minutes"
                  value={lastConsultationDurationMinutes}
                  onChange={(e) =>
                    setLastConsultationDurationMinutes(e.target.value)
                  }
                  type="number"
                />
              </div>

              <div className="flex flex-col gap-3">
                <Label htmlFor="last_consultation_notes">
                  Ghi Chú Tư Vấn Cuối Cùng
                </Label>
                <Input
                  id="last_consultation_notes"
                  value={lastConsultationNotes}
                  onChange={(e) => setLastConsultationNotes(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-3">
                  <Label htmlFor="last_consultation_type">
                    Loại Tư Vấn Cuối Cùng
                  </Label>
                  <Select
                    value={lastConsultationType}
                    onValueChange={setLastConsultationType}
                  >
                    <SelectTrigger
                      id="last_consultation_type"
                      className="w-full"
                    >
                      <SelectValue placeholder="Chọn loại tư vấn" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Phone_Call">
                        Cuộc gọi điện thoại
                      </SelectItem>
                      <SelectItem value="Online_Meeting">
                        Họp trực tuyến
                      </SelectItem>
                      <SelectItem value="In_Person">Trực tiếp</SelectItem>
                      <SelectItem value="Email">Email</SelectItem>
                      <SelectItem value="Chat">Trò chuyện</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Trạng thái Tư Vấn Cuối Cùng - Select */}
                <div className="flex flex-col gap-3">
                  <Label htmlFor="last_consultation_status">
                    Trạng Thái Tư Vấn Cuối Cùng
                  </Label>
                  <Select
                    value={lastConsultationStatus}
                    onValueChange={setLastConsultationStatus}
                  >
                    <SelectTrigger
                      id="last_consultation_status"
                      className="w-full"
                    >
                      <SelectValue placeholder="Chọn trạng thái tư vấn" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Scheduled">Đã lên lịch</SelectItem>
                      <SelectItem value="Completed">Hoàn thành</SelectItem>
                      <SelectItem value="Canceled">Đã hủy</SelectItem>
                      <SelectItem value="No Show">Không có mặt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tên Người Tư Vấn Cuối Cùng - READ ONLY */}
              <div className="flex flex-col gap-3">
                <Label htmlFor="last_consultation_counselor_name">
                  Tên Người Tư Vấn Cuối Cùng
                </Label>
                <Input
                  id="last_consultation_counselor_name"
                  value={lastConsultationCounselorName}
                  readOnly
                  className="bg-muted cursor-not-allowed"
                />
              </div>

              <SheetFooter className="mt-auto flex gap-2 sm:flex-col sm:space-x-0">
                <Button type="submit" className="w-full">
                  Lưu Thay Đổi
                </Button>
                <SheetClose asChild ref={sheetCloseRef}>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleCancel}
                  >
                    Hủy
                  </Button>
                </SheetClose>
              </SheetFooter>
            </form>
          </div>
        </SheetContent>
      </Sheet>
      {isSuccess && (
        <Alert className="fixed top-4 right-4 w-[350px]">
          <CheckCircle2Icon className="h-4 w-4 text-green-500" />
          <AlertTitle>Thành công!</AlertTitle>
          <AlertDescription>
            Thay đổi của bạn đã được lưu thành công.
          </AlertDescription>
        </Alert>
      )}
    </>
  );
}

// Thêm "use client" nếu bạn đang dùng App Router của Next.js và component này cần tương tác
// Ví dụ: "use client"

import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"; // Import các icon cần thiết
import { Badge } from "@/components/ui/badge"; // Import Badge component
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"; // Import Card components


const data = [
  { "id": 1, "hoTen": "Lưu Hoài Vũ", "lienHe": "123456789", "khoaHoc": "Tổng quan", "kenh": "Trang bìa", "trangThai": "Đang tư vấn" },
  { "id": 2, "hoTen": "Nguyễn Nhựt Tâm", "lienHe": "123456789", "khoaHoc": "Tổng quan", "kenh": "Mục lục", "trangThai": "Đã đăng ký" },
  { "id": 3, "hoTen": "Phú Đặng", "lienHe": "123456789", "khoaHoc": "Tổng quan", "kenh": "Kể chuyện", "trangThai": "Đã đăng ký" },
  { "id": 4, "hoTen": "Cách tiếp cận kỹ thuật", "lienHe": "Chưa có", "khoaHoc": "Kỹ thuật", "kenh": "Kể chuyện", "trangThai": "Đã đăng ký" },
  { "id": 5, "hoTen": "Thiết kế", "lienHe": "Chưa có", "khoaHoc": "Kỹ thuật", "kenh": "Kể chuyện", "trangThai": "Đang tư vấn" },
  { "id": 6, "hoTen": "Khả năng", "lienHe": "Chưa có", "khoaHoc": "Kỹ thuật", "kenh": "Kể chuyện", "trangThai": "Đang tư vấn" },
  { "id": 7, "hoTen": "Tích hợp với hệ thống hiện có", "lienHe": "Chưa có", "khoaHoc": "Kỹ thuật", "kenh": "Kể chuyện", "trangThai": "Đang tư vấn" },
  { "id": 8, "hoTen": "Đổi mới và lợi thế", "lienHe": "Chưa có", "khoaHoc": "Tổng quan", "kenh": "Kể chuyện", "trangThai": "Đã đăng ký" },
  { "id": 9, "hoTen": "Tổng quan về các giải pháp sáng tạo của EMR", "lienHe": "Chưa có", "khoaHoc": "Công nghệ", "kenh": "Nội dung kỹ thuật", "trangThai": "Đã đăng ký" },
  { "id": 10, "hoTen": "Thuật toán nâng cao và học máy", "lienHe": "Chưa có", "khoaHoc": "Công nghệ", "kenh": "Kể chuyện", "trangThai": "Đã đăng ký" },
  { "id": 11, "hoTen": "Giao thức truyền thông thích ứng", "lienHe": "Chưa có", "khoaHoc": "Công nghệ", "kenh": "Kể chuyện", "trangThai": "Đã đăng ký" },
  { "id": 12, "hoTen": "Lợi thế so với công nghệ hiện tại", "lienHe": "Chưa có", "khoaHoc": "Công nghệ", "kenh": "Kể chuyện", "trangThai": "Đã đăng ký" },
  { "id": 13, "hoTen": "Hiệu suất trước đây", "lienHe": "Chưa có", "khoaHoc": "Quản lý", "kenh": "Kể chuyện", "trangThai": "Đã đăng ký" },
  { "id": 14, "hoTen": "Phản hồi khách hàng và mức độ hài lòng", "lienHe": "Chưa có", "khoaHoc": "Quản lý", "kenh": "Kể chuyện", "trangThai": "Đã đăng ký" },
  { "id": 15, "hoTen": "Thách thức triển khai và giải pháp", "lienHe": "Chưa có", "khoaHoc": "Quản lý", "kenh": "Kể chuyện", "trangThai": "Đã đăng ký" },
  { "id": 16, "hoTen": "Biện pháp bảo mật và chính sách bảo vệ dữ liệu", "lienHe": "Chưa có", "khoaHoc": "Bảo mật", "kenh": "Kể chuyện", "trangThai": "Đang tư vấn" },
  { "id": 17, "hoTen": "Khả năng mở rộng và chống lỗi thời", "lienHe": "Chưa có", "khoaHoc": "Phát triển", "kenh": "Kể chuyện", "trangThai": "Đã đăng ký" },
  { "id": 18, "hoTen": "Phân tích chi phí-lợi ích", "lienHe": "Chưa có", "khoaHoc": "Quản lý", "kenh": "Ngôn ngữ đơn giản", "trangThai": "Đã đăng ký" },
  { "id": 19, "hoTen": "Đào tạo người dùng và trải nghiệm giới thiệu", "lienHe": "Chưa có", "khoaHoc": "Quản lý", "kenh": "Kể chuyện", "trangThai": "Đã đăng ký" },
  { "id": 20, "hoTen": "Lộ trình phát triển trong tương lai", "lienHe": "Chưa có", "khoaHoc": "Phát triển", "kenh": "Kể chuyện", "trangThai": "Đã đăng ký" },
  { "id": 21, "hoTen": "Tổng quan kiến trúc hệ thống", "lienHe": "Chưa có", "khoaHoc": "Kiến trúc", "kenh": "Nội dung kỹ thuật", "trangThai": "Đang tư vấn" },
  { "id": 22, "hoTen": "Kế hoạch quản lý rủi ro", "lienHe": "Chưa có", "khoaHoc": "Quản lý", "kenh": "Kể chuyện", "trangThai": "Đã đăng ký" },
  { "id": 23, "hoTen": "Tài liệu tuân thủ", "lienHe": "Chưa có", "khoaHoc": "Pháp lý", "kenh": "Pháp lý", "trangThai": "Đang tư vấn" },
  { "id": 24, "hoTen": "Tài liệu API", "lienHe": "Chưa có", "khoaHoc": "Phát triển", "kenh": "Nội dung kỹ thuật", "trangThai": "Đã đăng ký" },
  { "id": 25, "hoTen": "Bản phác thảo giao diện người dùng", "lienHe": "Chưa có", "khoaHoc": "Thiết kế", "kenh": "Hình ảnh", "trangThai": "Đang tư vấn" },
  { "id": 26, "hoTen": "Sơ đồ cơ sở dữ liệu", "lienHe": "Chưa có", "khoaHoc": "Cơ sở dữ liệu", "kenh": "Nội dung kỹ thuật", "trangThai": "Đã đăng ký" },
  { "id": 27, "hoTen": "Phương pháp kiểm thử", "lienHe": "Chưa có", "khoaHoc": "Kiểm thử", "kenh": "Nội dung kỹ thuật", "trangThai": "Đang tư vấn" },
  { "id": 28, "hoTen": "Chiến lược triển khai", "lienHe": "Chưa có", "khoaHoc": "Triển khai", "kenh": "Kể chuyện", "trangThai": "Đã đăng ký" },
  { "id": 29, "hoTen": "Chi tiết ngân sách", "lienHe": "Chưa có", "khoaHoc": "Tài chính", "kenh": "Tài chính", "trangThai": "Đang tư vấn" },
  { "id": 30, "hoTen": "Phân tích thị trường", "lienHe": "Chưa có", "khoaHoc": "Nghiên cứu", "kenh": "Nghiên cứu", "trangThai": "Đã đăng ký" },
  { "id": 31, "hoTen": "So sánh đối thủ", "lienHe": "Chưa có", "khoaHoc": "Nghiên cứu", "kenh": "Nghiên cứu", "trangThai": "Đang tư vấn" },
  { "id": 32, "hoTen": "Kế hoạch bảo trì", "lienHe": "Chưa có", "khoaHoc": "Bảo trì", "kenh": "Nội dung kỹ thuật", "trangThai": "Đã đăng ký" },
  { "id": 33, "hoTen": "Chân dung người dùng", "lienHe": "Chưa có", "khoaHoc": "Nghiên cứu", "kenh": "Nghiên cứu", "trangThai": "Đang tư vấn" },
  { "id": 34, "hoTen": "Tuân thủ khả năng truy cập", "lienHe": "Chưa có", "khoaHoc": "Pháp lý", "kenh": "Pháp lý", "trangThai": "Đã đăng ký" },
  { "id": 35, "hoTen": "Chỉ số hiệu suất", "lienHe": "Chưa có", "khoaHoc": "Kỹ thuật", "kenh": "Nội dung kỹ thuật", "trangThai": "Đang tư vấn" },
  { "id": 36, "hoTen": "Kế hoạch khắc phục sự cố", "lienHe": "Chưa có", "khoaHoc": "Bảo mật", "kenh": "Nội dung kỹ thuật", "trangThai": "Đã đăng ký" },
  { "id": 37, "hoTen": "Tích hợp bên thứ ba", "lienHe": "Chưa có", "khoaHoc": "Kỹ thuật", "kenh": "Nội dung kỹ thuật", "trangThai": "Đang tư vấn" },
  { "id": 38, "hoTen": "Tóm tắt phản hồi người dùng", "lienHe": "Chưa có", "khoaHoc": "Nghiên cứu", "kenh": "Nghiên cứu", "trangThai": "Đã đăng ký" },
  { "id": 39, "hoTen": "Chiến lược bản địa hóa", "lienHe": "Chưa có", "khoaHoc": "Phát triển", "kenh": "Kể chuyện", "trangThai": "Đang tư vấn" },
  { "id": 40, "hoTen": "Khả năng tương thích di động", "lienHe": "Chưa có", "khoaHoc": "Kỹ thuật", "kenh": "Nội dung kỹ thuật", "trangThai": "Đã đăng ký" },
  { "id": 41, "hoTen": "Kế hoạch di chuyển dữ liệu", "lienHe": "Chưa có", "khoaHoc": "Cơ sở dữ liệu", "kenh": "Nội dung kỹ thuật", "trangThai": "Đang tư vấn" },
  { "id": 42, "hoTen": "Giao thức đảm bảo chất lượng", "lienHe": "Chưa có", "khoaHoc": "Kiểm thử", "kenh": "Nội dung kỹ thuật", "trangThai": "Đã đăng ký" },
  { "id": 43, "hoTen": "Phân tích các bên liên quan", "lienHe": "Chưa có", "khoaHoc": "Nghiên cứu", "kenh": "Nghiên cứu", "trangThai": "Đang tư vấn" },
  { "id": 44, "hoTen": "Đánh giá tác động môi trường", "lienHe": "Chưa có", "khoaHoc": "Nghiên cứu", "kenh": "Nghiên dung", "trangThai": "Đã đăng ký" },
  { "id": 45, "hoTen": "Quyền sở hữu trí tuệ", "lienHe": "Chưa có", "khoaHoc": "Pháp lý", "kenh": "Pháp lý", "trangThai": "Đang tư vấn" },
  { "id": 46, "hoTen": "Khung hỗ trợ khách hàng", "lienHe": "Chưa có", "khoaHoc": "Quản lý", "kenh": "Kể chuyện", "trangThai": "Đã đăng ký" },
  { "id": 47, "hoTen": "Chiến lược kiểm soát phiên bản", "lienHe": "Chưa có", "khoaHoc": "Kỹ thuật", "kenh": "Nội dung kỹ thuật", "trangThai": "Đang tư vấn" },
  { "id": 48, "hoTen": "Hệ thống tích hợp liên tục", "lienHe": "Chưa có", "khoaHoc": "Kỹ thuật", "kenh": "Nội dung kỹ thuật", "trangThai": "Đã đăng ký" },
  { "id": 49, "hoTen": "Tuân thủ quy định", "lienHe": "Chưa có", "khoaHoc": "Pháp lý", "kenh": "Pháp lý", "trangThai": "Đang tư vấn" },
  { "id": 50, "hoTen": "Hệ thống xác thực người dùng", "lienHe": "Chưa có", "khoaHoc": "Bảo mật", "kenh": "Nội dung kỹ thuật", "trangThai": "Đã đăng ký" },
  { "id": 51, "hoTen": "Khung phân tích dữ liệu", "lienHe": "Chưa có", "khoaHoc": "Dữ liệu", "kenh": "Nội dung kỹ thuật", "trangThai": "Đang tư vấn" },
  { "id": 52, "hoTen": "Cơ sở hạ tầng đám mây", "lienHe": "Chưa có", "khoaHoc": "Cơ sở hạ tầng", "kenh": "Nội dung kỹ thuật", "trangThai": "Đã đăng ký" },
  { "id": 53, "hoTen": "Biện pháp bảo mật mạng", "lienHe": "Chưa có", "khoaHoc": "Bảo mật", "kenh": "Nội dung kỹ thuật", "trangThai": "Đang tư vấn" },
  { "id": 54, "hoTen": "Tiến độ dự án", "lienHe": "Chưa có", "khoaHoc": "Kế hoạch", "kenh": "Lập kế hoạch", "trangThai": "Đã đăng ký" },
  { "id": 55, "hoTen": "Phân bổ nguồn lực", "lienHe": "Chưa có", "khoaHoc": "Kế hoạch", "kenh": "Lập kế hoạch", "trangThai": "Đang tư vấn" },
  { "id": 56, "hoTen": "Cấu trúc nhóm và vai trò", "lienHe": "Chưa có", "khoaHoc": "Quản lý", "kenh": "Lập kế hoạch", "trangThai": "Đã đăng ký" },
  { "id": 57, "hoTen": "Giao thức truyền thông", "lienHe": "Chưa có", "khoaHoc": "Quản lý", "kenh": "Lập kế hoạch", "trangThai": "Đang tư vấn" },
  { "id": 58, "hoTen": "Chỉ số thành công", "lienHe": "Chưa có", "khoaHoc": "Quản lý", "kenh": "Lập kế hoạch", "trangThai": "Đã đăng ký" },
  { "id": 59, "hoTen": "Hỗ trợ quốc tế hóa", "lienHe": "Chưa có", "khoaHoc": "Phát triển", "kenh": "Nội dung kỹ thuật", "trangThai": "Đang tư vấn" },
  { "id": 60, "hoTen": "Quy trình sao lưu và phục hồi", "lienHe": "Chưa có", "khoaHoc": "Bảo mật", "kenh": "Nội dung kỹ thuật", "trangThai": "Đã đăng ký" },
  { "id": 61, "hoTen": "Hệ thống giám sát và cảnh báo", "lienHe": "Chưa có", "khoaHoc": "Vận hành", "kenh": "Nội dung kỹ thuật", "trangThai": "Đang tư vấn" },
  { "id": 62, "hoTen": "Hướng dẫn đánh giá mã", "lienHe": "Chưa có", "khoaHoc": "Kỹ thuật", "kenh": "Nội dung kỹ thuật", "trangThai": "Đã đăng ký" },
  { "id": 63, "hoTen": "Tiêu chuẩn tài liệu", "lienHe": "Chưa có", "khoaHoc": "Kỹ thuật", "kenh": "Nội dung kỹ thuật", "trangThai": "Đang tư vấn" },
  { "id": 64, "hoTen": "Quy trình quản lý phát hành", "lienHe": "Chưa có", "khoaHoc": "Kế hoạch", "kenh": "Lập kế hoạch", "trangThai": "Đã đăng ký" },
  { "id": 65, "hoTen": "Ma trận ưu tiên tính năng", "lienHe": "Chưa có", "khoaHoc": "Kế hoạch", "kenh": "Lập kế hoạch", "trangThai": "Đang tư vấn" },
  { "id": 66, "hoTen": "Đánh giá nợ kỹ thuật", "lienHe": "Chưa có", "khoaHoc": "Kỹ thuật", "kenh": "Nội dung kỹ thuật", "trangThai": "Đã đăng ký" },
  { "id": 67, "hoTen": "Lập kế hoạch năng lực", "lienHe": "Chưa có", "khoaHoc": "Kế hoạch", "kenh": "Lập kế hoạch", "trangThai": "Đang tư vấn" },
  { "id": 68, "hoTen": "Thỏa thuận mức dịch vụ", "lienHe": "Chưa có", "khoaHoc": "Pháp lý", "kenh": "Pháp lý", "trangThai": "Đã đăng ký" }
];


export function SectionCards() {
  // Tính toán các chỉ số
  const totalEntries = data.length;
  const dangTuVanCount = data.filter(item => item.trangThai === "Đang tư vấn").length;
  const daDangKyCount = data.filter(item => item.trangThai === "Đã đăng ký").length;

  // Giả định cho "Tiềm năng" và "Mới"
  // Tiềm năng: Những người đang tư vấn (lặp lại, hoặc bạn có thể định nghĩa khác)
  // Mới: Giả định một giá trị tăng trưởng cố định hoặc một phần nhỏ của tổng số
  // Để minh họa, tôi sẽ sử dụng "Đang tư vấn" cho Tiềm năng và một giá trị giả định cho "Mới"
  const tiemNangCount = dangTuVanCount; // Giả định: Tiềm năng = Đang tư vấn
  const moiCount = Math.floor(totalEntries * 0.15); // Giả định: 15% là mới


  // Tính toán tỷ lệ
  const percentDangTuVan = totalEntries > 0 ? ((dangTuVanCount / totalEntries) * 100).toFixed(1) : 0;
  const percentDaDangKy = totalEntries > 0 ? ((daDangKyCount / totalEntries) * 100).toFixed(1) : 0;
  const percentTiemNang = totalEntries > 0 ? ((tiemNangCount / totalEntries) * 100).toFixed(1) : 0;
  // Để biểu diễn "Mới" dưới dạng tỷ lệ, chúng ta cần một giá trị tham chiếu.
  // Nếu "Mới" thực sự là số lượng tuyệt đối, chúng ta có thể hiển thị số đó.
  // Ở đây, tôi sẽ dùng một giá trị giả định cho phần trăm tăng trưởng "Mới".
  const percentMoiTangTruong = 4.5; // Giả định: 4.5% tăng trưởng


  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* Thẻ 1: Tỷ lệ Đang tư vấn */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Tỷ lệ Đang tư vấn</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {percentDangTuVan}%
          </CardTitle>
          <CardAction>
            {/* Giả định xu hướng lên/xuống. Có thể cần thêm logic để xác định thực tế. */}
            <Badge variant="outline">
              <IconTrendingDown /> {/* Ví dụ: giảm */}
              -2.1%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Có {dangTuVanCount} mục đang tư vấn <IconTrendingDown className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Cần theo dõi và chuyển đổi
          </div>
        </CardFooter>
      </Card>

      {/* Thẻ 2: Tỷ lệ Đã đăng ký */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Tỷ lệ Đã đăng ký</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {percentDaDangKy}%
          </CardTitle>
          <CardAction>
            {/* Giả định xu hướng lên/xuống */}
            <Badge variant="outline">
              <IconTrendingUp /> {/* Ví dụ: tăng */}
              +5.0%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Có {daDangKyCount} mục đã đăng ký <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Số lượng đăng ký ổn định
          </div>
        </CardFooter>
      </Card>

      {/* Thẻ 3: Tỷ lệ Tiềm năng */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Tỷ lệ Tiềm năng</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {percentTiemNang}%
          </CardTitle>
          <CardAction>
            {/* Giả định xu hướng lên/xuống */}
            <Badge variant="outline">
              <IconTrendingUp /> {/* Ví dụ: tăng */}
              +1.2%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Có {tiemNangCount} mục tiềm năng <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Khả năng chuyển đổi cao
          </div>
        </CardFooter>
      </Card>

      {/* Thẻ 4: Tổng số lượng / Tỷ lệ mới (điều chỉnh cho phù hợp với dữ liệu hiện có) */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Tổng số mục</CardDescription> {/* Hoặc "Mục mới" nếu bạn có dữ liệu */}
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalEntries}
          </CardTitle>
          <CardAction>
            {/* Để hiển thị tỷ lệ mới, bạn cần dữ liệu quá khứ.
                Nếu không có, có thể hiển thị tỷ lệ tăng trưởng tổng thể hoặc số lượng mới.
                Ở đây, tôi dùng một giá trị giả định cho phần trăm tăng trưởng. */}
            <Badge variant="outline">
              <IconTrendingUp />
              +{percentMoiTangTruong}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Tổng số mục hiện có <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Đánh giá hiệu suất tổng thể
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

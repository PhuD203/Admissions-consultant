// Định nghĩa kiểu dữ liệu cho JSON trả về nếu bạn biết cấu trúc (ví dụ dưới đây)
export interface data {
  title: string;
  course?: {
    id: string;
    name: string;
    class?: {
      name: string;
    }[];
  }[];
}

export async function fetchCourseCategories(): Promise<data[]> {
  const response = await fetch('http://localhost:3000/api/Datauser');

  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }

  const data: data[] = await response.json();
  return data;
}

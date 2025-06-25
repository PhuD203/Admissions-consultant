// src/lib/api/fetchCourseCategories.ts

export interface CourseCategory {
  title: string;
  course?: {
    id: string;
    name: string;
    class?: {
      name: string;
    }[];
  }[];
}

export async function fetchCourseCategories(): Promise<CourseCategory[]> {
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  const url = `${API_BASE_URL}/api/uploadform/Datauser`;
  console.log('[fetchCourseCategories] Fetching from:', url);

  try {
    const response = await fetch(url, {
      // Optional: Thêm header nếu bạn muốn rõ ràng kiểu JSON
      headers: {
        'Content-Type': 'application/json',
      },
      // Bắt buộc nếu gọi từ server side trong Next.js (App Router)
      cache: 'no-store', // hoặc 'force-cache', tùy tình huống
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `❌ Failed to fetch data: ${response.status} ${response.statusText}\n${errorText}`
      );
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      console.error('❌ Unexpected data:', data);
      throw new Error(
        '❌ Invalid response format: expected an array of course categories'
      );
    }

    return data as CourseCategory[];
  } catch (error) {
    console.error('[fetchCourseCategories] ERROR:', error);
    throw error;
  }
}

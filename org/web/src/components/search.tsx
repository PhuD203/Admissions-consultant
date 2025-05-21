// components/ui/search.tsx
"use client"

import { Input } from "@/components/ui/input"
import { useState, useEffect } from 'react';
import useDebounce from '@/hooks/debounce';

// Khai báo interface cho props của Search component
interface SearchProps {
  onSearch: (searchTerm: string) => void;
}

export default function Search({ onSearch }: SearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);


  useEffect(() => {
    onSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, onSearch]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => { // Thêm kiểu cho event
    setSearchTerm(event.target.value);
  };

  return (
    <div className="relative w-80">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="absolute top-0 bottom-0 w-6 h-6 my-auto text-gray-500 left-3"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 o 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <Input
        type="text"
        placeholder="Tìm kiếm theo họ tên..."
        className="pl-12 pr-4"
        value={searchTerm}
        onChange={handleInputChange}
      />
    </div>
  )
}

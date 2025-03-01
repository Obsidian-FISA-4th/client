import React, { useState } from 'react'
import { Search, X } from 'lucide-react'

interface SidebarSearchProps {
  onSearchChange: (term: string) => void
}

export function SidebarSearch({ onSearchChange }: SidebarSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    onSearchChange(e.target.value)
  }

  const clearSearch = () => {
    setSearchTerm("")
    onSearchChange("")
  }

  return (
    <div className="p-2 border-b border-gray-200 dark:border-[#333]">
      <div className="relative">
        <Search
          size={14}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-[#999]"
        />
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full h-8 pl-8 pr-2 rounded bg-gray-200 dark:bg-[#333] text-sm border-none outline-none text-gray-800 dark:text-[#dcddde] placeholder-gray-400 dark:placeholder-[#999]"
        />
        {searchTerm && (
          <button
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-[#999]"
            onClick={clearSearch}
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  )
}
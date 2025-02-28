"use client"

import { createContext, useState, type ReactNode } from "react"

interface SearchContextType {
  searchTerm: string
  setSearchTerm: (term: string) => void
}

export const SearchContext = createContext<SearchContextType>({
  searchTerm: "",
  setSearchTerm: () => {},
})

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchTerm, setSearchTerm] = useState("")

  return <SearchContext.Provider value={{ searchTerm, setSearchTerm }}>{children}</SearchContext.Provider>
}


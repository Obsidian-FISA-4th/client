import { Menu } from "lucide-react"

interface HeaderProps {
  currentPath?: string
}

export function Header({currentPath }: HeaderProps) {
  return (
    <div className="h-10 border-b border-gray-200 dark:border-[#333] flex items-center px-4 bg-white dark:bg-[#0d1116]">
      {currentPath && <div className="ml-1 text-sm text-gray-600 dark:text-[#999]">{currentPath}</div>}
    </div>
  )
}


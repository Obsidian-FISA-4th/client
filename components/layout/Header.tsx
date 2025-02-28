import { Menu } from "lucide-react"

interface HeaderProps {
  toggleSidebar: () => void
  currentPath?: string
}

export function Header({ toggleSidebar, currentPath }: HeaderProps) {
  return (
    <div className="h-10 border-b border-gray-200 dark:border-[#333] flex items-center px-4 bg-white dark:bg-[#262626]">
      <button className="p-1 rounded hover:bg-gray-200 dark:hover:bg-[#333]" onClick={toggleSidebar}>
        <Menu size={16} />
      </button>

      {currentPath && <div className="ml-4 text-sm text-gray-600 dark:text-[#999]">{currentPath}</div>}
    </div>
  )
}


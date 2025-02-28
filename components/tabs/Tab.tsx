import { X } from "lucide-react"

interface TabsProps {
  openFiles: Array<{
    path: string
    active: boolean
  }>
  onTabClick: (path: string) => void
  onTabClose: (path: string) => void
}

export function Tabs({ openFiles, onTabClick, onTabClose }: TabsProps) {
  if (openFiles.length === 0) return null

  return (
    <div className="flex h-9 border-b border-gray-200 dark:border-[#333] bg-white dark:bg-[#262626] overflow-x-auto">
      {openFiles.map((file) => (
        <div
          key={file.path}
          className={`flex items-center h-full px-3 border-r border-gray-200 dark:border-[#333] cursor-pointer min-w-[120px] max-w-[200px] rounded-t-lg ${
            file.active ? "bg-gray-100 dark:bg-[#1e1e1e]" : "hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
          }`}
          onClick={() => onTabClick(file.path)}
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-sm truncate">{file.path.split("/").pop()}</span>
            <button
              className="ml-2 p-0.5 rounded-sm hover:bg-gray-200 dark:hover:bg-[#333]"
              onClick={(e) => {
                e.stopPropagation()
                onTabClose(file.path)
              }}
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}


import { TabItem } from "@/components/tabs/TabItem"

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
        <TabItem
          key={file.path}
          tabId={file.path}
          filePath={file.path}
          onTabClick={onTabClick}
          onTabClose={onTabClose}
          active={file.active}
        />
      ))}
    </div>
  )
}

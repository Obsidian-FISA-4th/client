import { ChevronRight, ChevronDown, FolderClosed, FolderOpen, FileText, Check } from "lucide-react";

export const FileTreeSection = ({
  fileSystem,
  expandedFolders,
  selectedFiles,
  toggleFileSelection,
  toggleFolder,
}: {
  fileSystem: any;
  expandedFolders: Record<string, boolean>;
  selectedFiles: string[];
  toggleFileSelection: (filePath: string) => void;
  toggleFolder: (folderPath: string) => void;
}) => {
  const renderFileTree = (node: any, depth = 0) => {
    const paddingLeft = depth * 16;

    if (node.type === "file") {
      const isSelected = selectedFiles.includes(node.path);

      return (
        <div
          key={node.id}
          className="flex items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-[#333] cursor-pointer"
          onClick={() => toggleFileSelection(node.path)}
          style={{ paddingLeft: `${paddingLeft + 16}px` }}
        >
          <div
            className={`w-5 h-5 rounded border ${
              isSelected ? "bg-blue-500 border-blue-500 flex items-center justify-center" : "border-gray-300 dark:border-[#555]"
            }`}
          >
            {isSelected && <Check size={14} className="text-white" />}
          </div>
          <div className="flex items-center ml-3">
            <FileText size={16} className="mr-2 text-gray-500 dark:text-[#999]" />
            <span className="text-sm text-gray-800 dark:text-[#dcddde]">{node.name}</span>
          </div>
        </div>
      );
    } else if (node.type === "folder") {
      const isExpanded = expandedFolders[node.path];

      return (
        <div key={node.id}>
          <div
            className="flex items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-[#333] cursor-pointer"
            style={{ paddingLeft: `${paddingLeft}px` }}
          >
            <div className="flex items-center" onClick={() => toggleFolder(node.path)}>
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              {isExpanded ? <FolderOpen size={16} className="ml-1" /> : <FolderClosed size={16} className="ml-1" />}
            </div>
            <span className="ml-2 text-sm font-medium text-gray-800 dark:text-[#dcddde]">{node.name}</span>
          </div>

          {isExpanded && <div>{node.children.map((child: any) => renderFileTree(child, depth + 1))}</div>}
        </div>
      );
    }

    return null;
  };

  return <div>{fileSystem.children.map((node: any) => renderFileTree(node))}</div>;
};
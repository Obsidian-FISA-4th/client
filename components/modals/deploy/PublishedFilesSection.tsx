import { FileText, Check } from "lucide-react";

export const PublishedFilesSection = ({
  publishedFiles,
  selectedFiles,
  toggleFileSelection,
}: {
  publishedFiles: string[];
  selectedFiles: string[];
  toggleFileSelection: (filePath: string) => void;
}) => {
  if (publishedFiles.length === 0) {
    return <div className="p-2 text-sm text-gray-500 dark:text-[#999]">No published files yet.</div>;
  }

  return (
    <div className="space-y-1">
      {publishedFiles.map((filePath) => {
        const isSelected = selectedFiles.includes(filePath);
        const fileName = filePath.split("/").pop() || "";
        const displayName = fileName.replace(/\.md$/, ""); 
        return (
          <div
            key={filePath}
            className="flex items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-[#333] cursor-pointer"
            onClick={() => toggleFileSelection(filePath)}
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
              <span className="text-sm text-gray-800 dark:text-[#dcddde]">{displayName}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
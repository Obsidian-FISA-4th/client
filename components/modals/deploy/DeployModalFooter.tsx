interface DeployModalFooterProps {
    selectedFilesCount: number;
    onCancel: () => void;
    onDeploy: () => void;
  }
  
  export const DeployModalFooter = ({ selectedFilesCount, onCancel, onDeploy }: DeployModalFooterProps) => {
    return (
      <div className="flex justify-between items-center p-4 border-t border-gray-200 dark:border-[#333]">
        <div className="text-sm text-gray-600 dark:text-[#999]">
          <span className="font-medium">{selectedFilesCount}</span> files selected for deployment
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-700 dark:text-[#dcddde] bg-gray-100 dark:bg-[#333] rounded hover:bg-gray-200 dark:hover:bg-[#444]"
          >
            Cancel
          </button>
          <button
            onClick={onDeploy}
            className="px-4 py-2 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
          >
            Deploy Changes
          </button>
        </div>
      </div>
    );
  };
"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { fetchFileSystemData } from "@/lib/api";
import { getRelativePath, transformApiResponseForDeployModal } from "@/lib/fileSystemUtils";
import { publishFiles, unpublishFiles } from "@/lib/api";
import { PublishedFilesSection } from "./PublishedFilesSection";
import { FileTreeSection } from "./FileTreeSection";
import { DeployModalFooter } from "./DeployModalFooter";

const HOME_DIR = process.env.HOME_DIR || "/default/note/";

export function DeployModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [publishedFiles, setPublishedFiles] = useState<string[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [fileSystem, setFileSystem] = useState<any>({
    id: "/",
    name: "root",
    path: "/",
    type: "folder",
    children: [],
  });

  useEffect(() => {
    const loadFileSystem = async () => {
      try {
        // API 호출
        const rawFileSystem = await fetchFileSystemData();

        // 파일 시스템 데이터 변환
        const transformedFileSystem = transformApiResponseForDeployModal(rawFileSystem);
        setFileSystem({
          id: "/",
          name: "root",
          path: "/",
          type: "folder",
          children: transformedFileSystem,
        });

        // `publish`가 true인 파일만 필터링
        const getPublishedFiles = (node: any): string[] => {
          if (node.folder) {
            return node.children.flatMap(getPublishedFiles);
          }
          return node.publish ? [node.path] : [];
        };

        const initialPublishedFiles = rawFileSystem.flatMap(getPublishedFiles);
        console.log("Initial published files:", initialPublishedFiles);

        setPublishedFiles(initialPublishedFiles);
        setSelectedFiles([...initialPublishedFiles]); // 기본적으로 배포된 파일 선택
      } catch (error) {
        console.error("Error fetching file system:", error);
      }
    };

    if (isOpen) {
      loadFileSystem();
    }
  }, [isOpen]);

  const handleDeploy = async () => {
    try {
      const filesToDeploy = selectedFiles
        .filter((file) => !publishedFiles.includes(file))
        .map((file) => getRelativePath(file, HOME_DIR));

      const filesToUndeploy = publishedFiles
        .filter((file) => !selectedFiles.includes(file))
        .map((file) => getRelativePath(file, HOME_DIR));

      if (filesToDeploy.length > 0) {
        await publishFiles(filesToDeploy);
      }

      if (filesToUndeploy.length > 0) {
        await unpublishFiles(filesToUndeploy);
      }

      setPublishedFiles(selectedFiles);
      onClose();
    } catch (error) {
      console.error("Error during deployment:", error);
    }
  };

  if (!isOpen || !fileSystem) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-[#262626] rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#333]">
          <h2 className="text-lg font-medium text-gray-800 dark:text-[#dcddde]">Deploy Files</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-[#333]">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Published Files Section */}
          <div className="p-4 border-b border-gray-200 dark:border-[#333] overflow-hidden flex flex-col">
            <h3 className="text-md font-medium text-gray-800 dark:text-[#dcddde] mb-2 flex items-center">
              Published Files
              <span className="ml-2 text-xs text-gray-500 dark:text-[#999]">({publishedFiles.length} files)</span>
            </h3>
            <div className="overflow-y-auto sidebar-content" style={{ maxHeight: "25vh" }}>
              <PublishedFilesSection
                publishedFiles={publishedFiles}
                selectedFiles={selectedFiles}
                toggleFileSelection={(filePath) =>
                  setSelectedFiles((prev) =>
                    prev.includes(filePath) ? prev.filter((path) => path !== filePath) : [...prev, filePath]
                  )
                }
              />
            </div>
          </div>

          {/* File Tree Section */}
          <div className="p-4 flex-1 overflow-hidden flex flex-col">
            <h3 className="text-md font-medium text-gray-800 dark:text-[#dcddde] mb-2">File System</h3>
            <div className="flex-1 overflow-y-auto sidebar-content">
              <FileTreeSection
                fileSystem={fileSystem}
                expandedFolders={expandedFolders}
                selectedFiles={selectedFiles}
                toggleFileSelection={(filePath) =>
                  setSelectedFiles((prev) =>
                    prev.includes(filePath) ? prev.filter((path) => path !== filePath) : [...prev, filePath]
                  )
                }
                toggleFolder={(folderPath) =>
                  setExpandedFolders((prev) => ({ ...prev, [folderPath]: !prev[folderPath] }))
                }
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <DeployModalFooter
          selectedFilesCount={selectedFiles.length}
          onCancel={onClose}
          onDeploy={handleDeploy}
        />
      </div>
    </div>
  );
}
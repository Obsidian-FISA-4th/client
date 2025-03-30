"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Tabs } from "@/components/tabs/Tabs";
import { WelcomeScreen } from "@/components/welcome/WelcomeScreen";
import { Editor } from "@/components/editor/Editor";
import { useFileSystemStore } from "@/store/fileSystemStore";
import { useState, useEffect } from "react";

interface CommonLayoutProps {
  isStudent: boolean;
  isStudentPage: boolean;
}

export function CommonLayout({ isStudent, isStudentPage }: CommonLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

    // 다크 모드 변경 시 HTML 태그에 적용
    useEffect(() => {
      document.documentElement.classList.toggle("dark", isDarkMode);
    }, [isDarkMode]);

  const {
    fileSystem,
    openFiles,
    activeFilePath,
    fileContent,
    handleFileClick,
    handleTabClose,
    handleContentChange,
    handleFileRename,
    handleDeleteFile,
    handleAddFile,
    handleAddFolder,
    handleMoveNode,
  } = useFileSystemStore();

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  const getCurrentPath = () => {
    if (!activeFilePath) return "";

    const parts = activeFilePath.split("/");
    parts.pop();
    return parts.join("/");
  };

  return (
    <div className={`flex h-screen w-full overflow-hidden ${isDarkMode ? "dark" : ""}`}>
      <div className="flex h-full w-full bg-white dark:bg-[#1e1e1e] text-gray-800 dark:text-[#dcddde]">
        <Sidebar
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          isDarkMode={isDarkMode}
          toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          onFileClick={handleFileClick}
          fileSystem={fileSystem}
          onDeployClick={isStudentPage ? undefined : () => {}}
          onSearchChange={handleSearchChange}
          onAddFile={isStudent ? undefined : handleAddFile}
          onAddFolder={isStudent ? undefined : handleAddFolder}
          onMoveNode={isStudent ? undefined : handleMoveNode}
          isStudentPage={isStudentPage}
        />
        <div className="flex flex-col flex-1 h-full overflow-hidden">
          <Header currentPath={activeFilePath ? getCurrentPath() : undefined} />

          <Tabs openFiles={openFiles} onTabClick={handleFileClick} onTabClose={handleTabClose} />

          {activeFilePath ? (
            isStudentPage ? (
              // TODO: iframe의 src를 변환된 HTML 파일로 설정
              <iframe src="/markdown.html" className="flex-1 h-full w-full" />
            ) : (
              <Editor
                content={fileContent}
                onChange={handleContentChange}
                filePath={activeFilePath}
                onDelete={handleDeleteFile}
                onRename={handleFileRename}
                isDarkMode={isDarkMode}
                toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
              />
            )
          ) : (
            <WelcomeScreen />
          )}
        </div>
      </div>
    </div>
  );
}
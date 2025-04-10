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
    handleUpdateFileContent,
    handleFileRename,
    handleDeleteFile,
    handleAddFile,
    handleAddFolder,
    handleMoveNode,
  } = useFileSystemStore();

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  const handleEditorChange = (newContent: string) => {
    if (activeFilePath) {
      handleUpdateFileContent(activeFilePath, newContent);
    }
  };

  const getCurrentPath = () => {
    if (!activeFilePath) return "";

    const parts = activeFilePath.split("/");
    parts.pop();
    return parts.join("/");
  };

  // HTML 파일 경로 생성
  const getHtmlFilePath = () => {
    if (!activeFilePath) return null;

    // .env 파일에서 HOME_DIR 값을 가져옴
    const homeDir = process.env.HOME_DIR || "/default/note/";
    const nginxUrl = process.env.NG_URL;

    const relativePath = activeFilePath.slice(homeDir.length).replace(/\.md$/, "");
    console.log("relativePath", relativePath);

    // "/pages/" 경로로 반환
    return `${nginxUrl}/pages/${relativePath}`;
    
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
          onDeployClick={isStudentPage ? undefined : () => { }}
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
              <iframe
                src={getHtmlFilePath() || ""}
                className="flex-1 h-full w-full"
                title="Markdown Preview"
              />
            ) : (
              <Editor
                content={fileContent}
                onChange={handleEditorChange}
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
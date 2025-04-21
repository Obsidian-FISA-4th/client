"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Tabs } from "@/components/tabs/Tabs";
import { WelcomeScreen } from "@/components/welcome/WelcomeScreen";
import { Editor } from "@/components/editor/Editor";
import { useFileSystemStore } from "@/store/fileSystemStore";
import { useState, useEffect } from "react";
import MDEditor from "@uiw/react-md-editor";

interface CommonLayoutProps {
  isStudent: boolean;
  isStudentPage: boolean;
}

export function CommonLayout({ isStudent, isStudentPage }: CommonLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);

  // 다크 모드 변경 시 HTML 태그에 적용
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const {
    fileSystem,
    fetchFileSystem,
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

  useEffect(() => {
  }, [isStudent, isStudentPage]);

  useEffect(() => {
    // studentPage 여부를 fetchFileSystem에 넘기는 부분
    fetchFileSystem(isStudentPage);
  }, [fetchFileSystem, isStudentPage]);

  useEffect(() => {
    console.log("fileSystem updated:", fileSystem);
  }, [fileSystem]);

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
    const homeDir = process.env.HOME_DIR || "/default/note/";
    const relativePath = activeFilePath.startsWith(homeDir)
      ? activeFilePath.substring(homeDir.length)
      : activeFilePath;

    const parts = relativePath.split("/");
    parts.pop();
    return parts.join("/");
  };


  return (
    <div className={`flex h-screen w-full ${isDarkMode ? "dark" : ""}`}>
      <div className="flex h-full w-full bg-white dark:bg-[#0d1116] text-gray-800 dark:text-[#dcddde]">
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
        <div className="flex flex-col flex-1 h-full max-w-[1440px] mx-auto w-full p-8 overflow-hidden">
          <Header currentPath={activeFilePath ? getCurrentPath() : undefined} />
          {activeFilePath ? (
            isStudentPage ? (
              <div className="flex flex-col h-full">
                <div className="p-4 flex-1 min-h-0 overflow-y-auto">
                  <div
                    className="
        max-w-3xl mx-auto
        prose dark:prose-invert
        prose-headings:text-black prose-p:text-black prose-li:text-black prose-a:text-black 
        dark:prose-headings:text-white dark:prose-p:text-white dark:prose-li:text-white dark:prose-a:text-white
      "
                  >
                    <div className="text-3xl font-semibold text-gray-800 dark:text-gray-200 pb-10">
                      {activeFilePath.split('/').pop()?.replace(/\.md$/, '')}
                    </div>
                    <MDEditor.Markdown
                      source={fileContent}
                      className="prose dark:prose-invert"
                      wrapperElement={{ 'data-color-mode': isDarkMode ? 'dark' : 'light' }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <Editor
                content={fileContent}
                onChange={handleEditorChange}
                filePath={activeFilePath}
                onDelete={handleDeleteFile}
                onRename={handleFileRename}
                isDarkMode={isDarkMode}
                toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
                isDeployModalOpen={isDeployModalOpen}
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
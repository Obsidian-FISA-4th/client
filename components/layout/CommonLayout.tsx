import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Tabs } from "@/components/tabs/Tabs";
import { WelcomeScreen } from "@/components/welcome/WelcomeScreen";
import { Editor } from "@/components/editor/Editor";
import { useFileSystemStore } from "@/store/fileSystemStore";
import { useState } from "react";

interface CommonLayoutProps {
  isStudent: boolean;
  isStudentPage: boolean;
}

export function CommonLayout({ isStudent, isStudentPage }: CommonLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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
            <Editor
              content={fileContent}
              onChange={handleContentChange}
              filePath={activeFilePath}
              onDelete={ handleDeleteFile}
              onRename={handleFileRename}
            />
          ) : (
            <WelcomeScreen />
          )}
        </div>
      </div>
    </div>
  );
}
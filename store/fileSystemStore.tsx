import { create } from "zustand";

import { fetchFileSystemData, createFileOrFolder, moveFileOrFolder, updateMarkdown, fetchFileContent, uploadImages, deleteFileOrFolder } from "@/lib/api";
import { getRelativePath, transformApiResponse, FileSystemNode } from "@/lib/fileSystemUtils";

const HOME_DIR = process.env.HOME_DIR || "/default/note/";

interface FolderNode extends FileSystemNode {
  children: FileSystemNode[];
}

interface OpenFile {
  path: string;
  content: string;
  active: boolean;
}

interface FileSystemState {
  fileSystem: FolderNode | null;
  openFiles: OpenFile[];
  activeFilePath: string | null;
  fileContent: string;
  setFileSystem: (fileSystem: FolderNode) => void;
  fetchFileSystem: (isStudentPage: boolean) => Promise<void>;
  handleFileClick: (filePath: string) => void;
  handleUpdateFileContent: (filePath: string, newContent: string) => void;
  handleDeleteFile: (path: string, type: 'file' | 'folder', isStudentPage?: boolean) => Promise<void>;
  handleTabClose: (filePath: string) => void;
  handleAddFile: (folderPath: string, fileName: string, isStudentPage?: boolean) => Promise<void>;
  handleAddFolder: (parentPath: string, folderName: string, isStudentPage?: boolean) => Promise<void>;
  handleMoveNode: (nodePath: string, targetFolderPath: string, isStudentPage?: boolean) => Promise<void>;
}

export const useFileSystemStore = create<FileSystemState>((set, get) => ({
  fileSystem: null,
  openFiles: [],
  activeFilePath: null,
  fileContent: "",

  // 파일 시스템 상태 설정
  setFileSystem: (fileSystem) => set({ fileSystem }),

  /***************** 초기 파일 내용 가져오기 start *************************/
  fetchFileSystem: async (isStudentPage = false) => {
    try {
      const result = await fetchFileSystemData();
      const transformedData = transformApiResponse(result, isStudentPage);
      set({ fileSystem: { id: "/", name: "root", type: "folder", path: "/", children: transformedData } });
    } catch (error) {
      console.error("Error fetching file system:", error);
    }
  },
  /*****************초기  파일 내용 가져오기 end *************************/

  /*****************클릭 시 파일 내용 가져오기 start **********************/
  handleFileClick: async (filePath) => {
    const { openFiles } = get();
    try {
      const content = await fetchFileContent(filePath);
      const updatedOpenFiles = openFiles.map((file) =>
        file.path === filePath ? { ...file, active: true, content } : { ...file, active: false }
      );
      set({
        openFiles: updatedOpenFiles,
        activeFilePath: filePath,
        fileContent: content,
      });
    } catch (error) {
      console.error(`Failed to fetch content for ${filePath}:`, error);
    }
  },
  /***************** 클릭 시 파일 내용 가져오기 end *********************/


  /***************** 파일 내용 업데이트 start *************************/
  handleUpdateFileContent: async (filePath: string, newContent: string) => {
    const { fileSystem, openFiles } = get();
    if (!fileSystem) return;

    const newFileSystem = { ...fileSystem };

    // 파일 시스템에서 파일 내용 업데이트
    const updateFileContent = (node: FileSystemNode): boolean => {
      if (node.path === filePath) {
        node.content = newContent;
        return true;
      }
      if (node.type === "folder" && node.children) {
        return node.children.some(updateFileContent);
      }
      return false;
    };

    updateFileContent(newFileSystem);


    await updateMarkdown(filePath, newContent);

    // 상태 업데이트
    set({
      fileSystem: newFileSystem,
      openFiles: openFiles.map((file) =>
        file.path === filePath ? { ...file, content: newContent } : file
      ),
      fileContent: newContent,
    });
  },

  /***************** 파일 내용 업데이트 end *************************/


  /***************** 파일 이름 변경 start *************************/
  handleFileRename: async (oldPath: string, newName: string): Promise<void> => {
    const { fileSystem, openFiles } = get();

    if (!fileSystem) return;

    try {
      const relativePath = getRelativePath(oldPath, HOME_DIR);
      await renameFile(relativePath, newName); 

      // 파일 시스템에서 파일 이름 변경
      const updateFileName = (node: FileSystemNode): boolean => {
        if (node.path === oldPath) {
          node.name = newName;
          const oldFileName = oldPath.split("/").pop() || "";
          node.path = oldPath.replace(oldFileName, newName);
          return true;
        }
        if (node.type === "folder" && node.children) {
          return node.children.some(updateFileName);
        }
        return false;
      };

      const updatedFileSystem = { ...fileSystem };
      updateFileName(updatedFileSystem);

      // 파일 탭에서 경로도 변경
      const updatedOpenFiles = openFiles.map((file: OpenFile) =>
        file.path === oldPath
          ? { ...file, path: oldPath.replace(oldPath.split("/").pop() || "", newName) }
          : file
      );

      // 백엔드 API 호출
      const fileName = oldPath.split("/").pop() || "";
      await renameFile (oldPath, fileName);

      set({
        fileSystem: updatedFileSystem,
        openFiles: updatedOpenFiles,
      });
    } catch (error) {
      console.error("Error renaming file:", error);
    }
  },
  /***************** 파일 이름 변경 end *************************/



  /* ***************파일 또는 폴더 삭제 start*************** */
  handleDeleteFile: async (path: string, type: 'file' | 'folder', isStudentPage = false) => {
    const { fileSystem, handleTabClose } = get();
    if (!fileSystem || !path) return;
  
    try {
      // 백엔드 API 호출
      await deleteFileOrFolder(path);
  
      // 파일 시스템 상태 업데이트
      const updatedFileSystem = await fetchFileSystemData(); // 최신 파일 시스템 데이터 가져오기
      const transformedData = transformApiResponse(updatedFileSystem, isStudentPage); // 데이터 변환
  
      set({
        fileSystem: { id: "/", name: "root", type: "folder", path: "/", children: transformedData },
      });
  
      // 파일 삭제 시 탭 닫기
      if (type === 'file') {
        handleTabClose(path);
      }
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
    }
  },
  /* ***************파일 또는 폴더 삭제 end*************** */



  /* ***************새 파일 및 폴더 추가start*************** */
  handleAddFile: async (folderPath, fileName, isStudentPage = false) => {
    try {
      const relativePath = getRelativePath(folderPath, HOME_DIR) + "/" + fileName;
      await createFileOrFolder(relativePath, "file");
      await get().fetchFileSystem(isStudentPage);
    } catch (error) {
      console.error("Error adding file:", error);
    }
  },

  handleAddFolder: async (parentPath, folderName, isStudentPage = false) => {
    try {
      const relativePath = getRelativePath(parentPath, HOME_DIR) + "/" + folderName;
      await createFileOrFolder(relativePath, "folder");
      await get().fetchFileSystem(isStudentPage);
    } catch (error) {
      console.error("Error adding folder:", error);
    }
  },

  /* ***************새 파일 및 폴더 추가 end*************** */

  /* ***************새 파일 및 폴더 이동 start*************** */
  handleMoveNode: async (nodePath, targetFolderPath, isStudentPage = false) => {
    try {
      const relativeNodePath = getRelativePath(nodePath, HOME_DIR);
      const relativeTargetFolderPath = getRelativePath(targetFolderPath, HOME_DIR);
      await moveFileOrFolder(relativeNodePath, relativeTargetFolderPath);
      await get().fetchFileSystem(isStudentPage);
    } catch (error) {
      console.error("Error moving node:", error);
    }
  },

  /* ***************새 파일 및 폴더 이동 end*************** */


  /* ***************파일 탭 닫기 start******************* */
  handleTabClose: (filePath) => {
    const { openFiles, activeFilePath } = get();
    const newOpenFiles = openFiles.filter((file) => file.path !== filePath);
    set({
      openFiles: newOpenFiles,
      activeFilePath: filePath === activeFilePath ? (newOpenFiles[0]?.path || null) : activeFilePath,
      fileContent: filePath === activeFilePath ? (newOpenFiles[0]?.content || "") : get().fileContent,
    });
  },
}));
/* ***************파일 탭 닫기 end********************* */
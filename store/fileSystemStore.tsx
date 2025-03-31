import { create } from "zustand";
import { fetchFileSystemData, createFileOrFolder, moveFileOrFolder, saveMarkdown, fetchFileContent, uploadImages, deleteFileOrFolder } from "@/lib/api";
import { getRelativePath, transformApiResponse, FileSystemNode } from "@/lib/fileSystemUtils";

const BASE_URL = process.env.BASE_URL || "/default/note/";
const HOME_DIR = process.env.HOME_DIR || "/default/home/";

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
  fetchFileSystem: () => Promise<void>;
  handleFileClick: (filePath: string) => void;
  handleUpdateFileContent: (filePath: string, newContent: string) => void;
  handleFileRename: (oldPath: string, newName: string) => void;
  handleDeleteFile: () => void;
  handleTabClose: (filePath: string) => void;
  handleAddFile: (folderPath: string, fileName: string) => Promise<void>;
  handleAddFolder: (parentPath: string, folderName: string) => Promise<void>;
  handleMoveNode: (nodePath: string, targetFolderPath: string) => Promise<void>;
}

export const useFileSystemStore = create<FileSystemState>((set, get) => ({
  fileSystem: null,
  openFiles: [],
  activeFilePath: null,
  fileContent: "",

  // 파일 시스템 상태 설정
  setFileSystem: (fileSystem) => set({ fileSystem }),

  /***************** 초기 파일 내용 가져오기 start *************************/
  fetchFileSystem: async () => {
    try {
      const result = await fetchFileSystemData();
      const transformedData = transformApiResponse(result);
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

    // 이미지 업로드 처리
    let updatedContent = newContent;
    // if (localImages.length > 0) {
    //   const uploadedImageUrls = await uploadImages(localImages);
    //   const markdownImageTags = uploadedImageUrls.map((url) => `![](${url})`).join("\n");
    //   updatedContent += `\n${markdownImageTags}`;
    // }

    // 백엔드 API 호출
    const fileName = filePath.split("/").pop() || "";
    await saveMarkdown(filePath, fileName, updatedContent);

    // 상태 업데이트
    set({
      fileSystem: newFileSystem,
      openFiles: openFiles.map((file) =>
        file.path === filePath ? { ...file, content: updatedContent } : file
      ),
      fileContent: updatedContent,
    });
  },

  /***************** 파일 내용 업데이트 end *************************/

  /***************** 파일 이름 변경 start *************************/
  handleFileRename: async (oldPath, newName) => {
    const { fileSystem } = get();
    if (!fileSystem) return;

    const newFileSystem = { ...fileSystem };
    const newPath = renameNode(oldPath, newName, newFileSystem);

    if (newPath) {
      set({ fileSystem: newFileSystem });
    }
    await get().fetchFileSystem();
  },
  /***************** 파일 이름 변경 end *************************/


  /* ***************파일 또는 폴더 삭제 start*************** */
  handleDeleteFile: async () => {
    const { activeFilePath, fileSystem, handleTabClose } = get();
    if (!fileSystem || !activeFilePath) return;
  
    try {
      // 백엔드 API 호출
      await deleteFileOrFolder(activeFilePath);
  
      // 파일 시스템 상태 업데이트
      const updatedFileSystem = await fetchFileSystemData(); // 최신 파일 시스템 데이터 가져오기
      const transformedData = transformApiResponse(updatedFileSystem); // 데이터 변환
  
      set({
        fileSystem: { id: "/", name: "root", type: "folder", path: "/", children: transformedData },
      });
  
      // 삭제된 파일의 탭 닫기
      handleTabClose(activeFilePath);
    } catch (error) {
      console.error("Error deleting file or folder:", error);
    }
  },
  /* ***************파일 또는 폴더 삭제 end*************** */



  /* ***************새 파일 및 폴더 추가start*************** */
  handleAddFile: async (folderPath, fileName) => {
    try {
      const relativePath = getRelativePath(folderPath, BASE_URL) + "/" + fileName;
      await createFileOrFolder(relativePath, "file");
      await get().fetchFileSystem();
    } catch (error) {
      console.error("Error adding file:", error);
    }
  },

  handleAddFolder: async (parentPath, folderName) => {
    try {
      const relativePath = getRelativePath(parentPath, BASE_URL) + "/" + folderName;
      await createFileOrFolder(relativePath, "folder");
      await get().fetchFileSystem();
    } catch (error) {
      console.error("Error adding folder:", error);
    }
  },

  /* ***************새 파일 및 폴더 추가 end*************** */

  /* ***************새 파일 및 폴더 이동 start*************** */
  handleMoveNode: async (nodePath, targetFolderPath) => {
    try {
      const relativeNodePath = getRelativePath(nodePath, HOME_DIR);
      const relativeTargetFolderPath = getRelativePath(targetFolderPath, HOME_DIR);
      await moveFileOrFolder(relativeNodePath, relativeTargetFolderPath);
      await get().fetchFileSystem();
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
import { create } from 'zustand'
import { fetchFileSystemData, createFileOrFolder, moveFileOrFolder } from '@/utils/api'
import { getRelativePath, moveNode, getRelativePath2 } from '@/utils/fileSystemUtils'


/**
 * Zustand을 통한 파일 시스템 관리
 */
export interface FileSystemNode {
  id: string
  name: string
  type: 'file' | 'folder'
  path: string
  children: FileSystemNode[]
}

interface FolderNode extends FileSystemNode {
  children: FileSystemNode[]
}

interface OpenFile {
  path: string
  content: string
  active: boolean
}

interface FileSystemState {
  fileSystem: FolderNode | null
  openFiles: OpenFile[]
  activeFilePath: string | null
  fileContent: string
  setFileSystem: (fileSystem: FolderNode) => void
  fetchFileSystem: () => Promise<void>
  handleFileClick: (filePath: string) => void
  handleContentChange: (newContent: string) => void
  handleFileRename: (oldPath: string, newName: string) => void
  handleDeleteFile: () => void
  handleTabClose: (filePath: string) => void
  handleAddFile: (folderPath: string, fileName: string) => Promise<void>
  handleAddFolder: (parentPath: string, folderName: string) => Promise<void>
  handleMoveNode: (nodePath: string, targetFolderPath: string) => Promise <void>
}

const transformApiResponse = (data: any[]): FileSystemNode[] => {
  return data
    .filter(item => item.name !== '.DS_Store') // .DS_Store 파일 제외
    .map(item => ({
      id: item.path,
      name: item.name,
      type: item.folder ? 'folder' : 'file',
      path: item.path,
      children: transformApiResponse(item.children || [])
    }))
}

// getFileContent 함수 추가 (파일 내용 가져오기)
const getFileContent = (filePath: string, fileSystem: FolderNode | null): string | null => {
  if (!fileSystem) return null;

  const findFile = (node: FileSystemNode): FileSystemNode | null => {
    if (node.path === filePath) return node;
    if (node.type === 'folder' && node.children) {
      for (const child of node.children) {
        const result = findFile(child);
        if (result) return result;
      }
    }
    return null;
  };

  const fileNode = findFile(fileSystem);
  return fileNode && fileNode.type === 'file' ? fileNode.name : null; 
};


export const useFileSystemStore = create<FileSystemState>((set, get) => ({
  fileSystem: null,
  openFiles: [],
  activeFilePath: null,
  fileContent: "",
  setFileSystem: (fileSystem) => set({ fileSystem }),
  fetchFileSystem: async () => {
    try {
      const result = await fetchFileSystemData()
      const transformedData = transformApiResponse(result)
      set({ fileSystem: { id: '/', name: 'root', type: 'folder', path: '/', children: transformedData } })
    } catch (error) {
      console.error('Error fetching file system:', error)
    }
  },
  handleFileClick: (filePath) => {
    const { openFiles, fileSystem } = get()
    const isFileOpen = openFiles.some((file) => file.path === filePath)
    if (isFileOpen) {
      // 파일이 열려 있는 경우 활성화
      set({
        openFiles: openFiles.map((file) => ({ ...file, active: file.path === filePath })),
        activeFilePath: filePath,
        fileContent: openFiles.find((file) => file.path === filePath)?.content || "",
      })
    } else {
      // 파일이 열려있지 않은 경우 새로 열기
      const content = getFileContent(filePath, fileSystem) || `# ${filePath}\n\nStart writing here...`
      set({
        openFiles: [...openFiles.map((file) => ({ ...file, active: false })), { path: filePath, content, active: true }],
        activeFilePath: filePath,
        fileContent: content,
      })
    }
  },
  handleContentChange: (newContent) => {
    const { activeFilePath, openFiles, fileSystem } = get()
    if (activeFilePath) {
      const newFileSystem = { ...fileSystem }
      updateFileContent(activeFilePath, newContent, newFileSystem)
      set({
        fileContent: newContent,
        openFiles: openFiles.map((file) => (file.path === activeFilePath ? { ...file, content: newContent } : file)),
        fileSystem: newFileSystem,
      })
    }
  },
  handleFileRename: (oldPath, newName) => {
    const { fileSystem, openFiles, activeFilePath } = get()
    const newFileSystem = { ...fileSystem }
    const newPath = renameFile(oldPath, newName, newFileSystem)
    if (newPath) {
      set({
        fileSystem: newFileSystem,
        openFiles: openFiles.map((file) => (file.path === oldPath ? { ...file, path: newPath } : file)),
        activeFilePath: activeFilePath === oldPath ? newPath : activeFilePath,
      })
    }
  },
  handleDeleteFile: () => {
    const { activeFilePath, fileSystem, handleTabClose } = get()
    if (activeFilePath) {
      const newFileSystem = { ...fileSystem }
      const success = deleteFile(activeFilePath, newFileSystem)
      if (success) {
        set({ fileSystem: newFileSystem })
        handleTabClose(activeFilePath)
      }
    }
  },
  handleTabClose: (filePath) => {
    const { openFiles, activeFilePath } = get()
    const fileIndex = openFiles.findIndex((file) => file.path === filePath)
    if (fileIndex !== -1) {
      const newOpenFiles = [...openFiles]
      newOpenFiles.splice(fileIndex, 1)
      set({
        openFiles: newOpenFiles,
        activeFilePath: filePath === activeFilePath ? (newOpenFiles.length > 0 ? newOpenFiles[0].path : null) : activeFilePath,
        fileContent: filePath === activeFilePath ? (newOpenFiles.length > 0 ? newOpenFiles[0].content : "") : get().fileContent,
      })
    }
  },
  handleAddFile: async (folderPath, fileName) => {
    try {
      const relativePath = getRelativePath(folderPath)
      await createFileOrFolder(relativePath + '/' + fileName, 'file')
      await get().fetchFileSystem()
    } catch (error) {
      console.error('Error adding file:', error)
    }
  },
  handleAddFolder: async (parentPath, folderName) => {
    try {
      const relativePath = getRelativePath(parentPath)
      await createFileOrFolder(relativePath + '/' + folderName, 'folder')
      await get().fetchFileSystem()
    } catch (error) {
      console.error('Error adding folder:', error)
    }
  },

  handleMoveNode: async (nodePath, targetFolderPath) => {
    try {
      const relativeNodePath = getRelativePath2(nodePath)
      const relativeTargetFolderPath = getRelativePath2(targetFolderPath)
      await moveFileOrFolder(relativeNodePath, relativeTargetFolderPath)
      const { fileSystem } = get()
      const newFileSystem = { ...fileSystem }
      const success = moveNode(relativeNodePath, relativeTargetFolderPath, newFileSystem)
      if (success) {
        set({ fileSystem: newFileSystem })
      }
      await get().fetchFileSystem()
    } catch (error) {
      console.error('Error moving node:', error)
    }
  },
}))

// 상태 변경 시 JSON 형식으로 저장
useFileSystemStore.subscribe((state) => {
  const fileSystemJson = JSON.stringify(state.fileSystem, null, 2)
  console.log('Updated File System:', fileSystemJson)
  // TODO : fileSystemJson 파일 저장, 서버 전송 로직 작성 (추후)
})
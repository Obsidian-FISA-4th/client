import { create } from 'zustand'
import { fetchFileSystemData, createFileOrFolder } from '@/utils/api'
import { getRelativePath } from '@/utils/fileSystemUtils'

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
  handleMoveNode: (nodePath: string, targetFolderPath: string) => void
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
      set({
        openFiles: openFiles.map((file) => ({ ...file, active: file.path === filePath })),
        activeFilePath: filePath,
        fileContent: openFiles.find((file) => file.path === filePath)?.content || "",
      })
    } else {
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
  handleMoveNode: (nodePath, targetFolderPath) => {
    const { fileSystem } = get()
    const newFileSystem = { ...fileSystem }
    const success = moveNode(nodePath, targetFolderPath, newFileSystem)
    if (success) {
      set({ fileSystem: newFileSystem })
    }
  },
}))

// 상태 변경 시 JSON 형식으로 저장
useFileSystemStore.subscribe((state) => {
  const fileSystemJson = JSON.stringify(state.fileSystem, null, 2)
  console.log('Updated File System:', fileSystemJson)
  // TODO : fileSystemJson 파일 저장, 서버 전송 로직 작성 (추후)
})
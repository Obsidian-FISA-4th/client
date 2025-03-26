export interface FileNode {
    id: string
    name: string
    path: string
    content: string
    type: "file"
    level: number
    depth: number
}

function findFolder(path: string, folder: FolderNode): FolderNode | null {
    if (folder.path === path) return folder
    for (const child of folder.children) {
        if (child.type === "folder") {
            const result = findFolder(path, child)
            if (result) return result
        }
    }
    return null
}

export interface FolderNode {
    id: string
    name: string
    path: string
    type: "folder"
    children: (FileNode | FolderNode)[]
    level: number
    depth: number
}

type FileSystemNode = FileNode | FolderNode

/* 상대 경로 변환 유틸리티 함수 */
export const getRelativePath = (fullPath: string) => {
    const base = '/Users/msy/note/';
    return fullPath.startsWith(base) ? fullPath.substring(base.length) : fullPath;
}

function sortChildren(children: (FileNode | FolderNode)[]): (FileNode | FolderNode)[] {
    return children.sort((a, b) => {
        if (a.type === "folder" && b.type === "file") return -1
        if (a.type === "file" && b.type === "folder") return 1
        return a.name.localeCompare(b.name)
    })
}

export function addFolder(parentPath: string, folderName: string, fileSystem: FolderNode): string | null {
    const relativeParentPath = getRelativePath(parentPath)
    const parent = relativeParentPath === '' ? fileSystem : findFolder(relativeParentPath, fileSystem)
    if (!parent) return null

    // 새로운 폴더 ID 생성
    const folderId = folderName.toLowerCase().replace(/[^a-z0-9]/g, "-")

    // 전체 경로 생성
    const folderPath = relativeParentPath ? `${relativeParentPath}/${folderName}` : folderName

    // 새로운 폴더 생성
    const newFolder: FolderNode = {
        id: folderId,
        name: folderName,
        path: folderPath,
        type: "folder",
        children: [],
        level: parent.level + 1,
        depth: parent.depth + 1,
    }

    // 폴더를 부모 폴더에 추가
    parent.children.push(newFolder)
    parent.children = sortChildren(parent.children)

    return folderPath
}

export function addFile(parentPath: string, fileName: string, content = "", fileSystem: FolderNode): string | null {
    const relativeParentPath = getRelativePath(parentPath)
    const parent = relativeParentPath === '' ? fileSystem : findFolder(relativeParentPath, fileSystem)
    if (!parent) return null

    // 새로운 파일 ID 생성
    const fileId = fileName.toLowerCase().replace(/[^a-z0-9]/g, "-")

    // 전체 경로 생성
    const filePath = relativeParentPath ? `${relativeParentPath}/${fileName}` : fileName

    // 새로운 파일 생성
    const newFile: FileNode = {
        id: fileId,
        name: fileName,
        path: filePath,
        content:
            content ||
            `# ${fileName.replace(".md", "")}

Start writing here...`,
        type: "file",
        level: parent.level + 1,
        depth: parent.depth + 1,
    }

    // 파일을 부모 폴더에 추가
    parent.children.push(newFile)
    parent.children = sortChildren(parent.children)

    return filePath
}
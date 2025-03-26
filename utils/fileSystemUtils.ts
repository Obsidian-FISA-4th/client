export interface FileNode {
    id: string
    name: string
    path: string
    content: string
    type: "file"
    level: number
    depth: number
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


export const getRelativePath2 = (fullPath: string) => {
    const base = '/Users/msy/';
    return fullPath.startsWith(base) ? fullPath.substring(base.length) : fullPath;
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


function sortChildren(children: (FileNode | FolderNode)[]): (FileNode | FolderNode)[] {
    return children.sort((a, b) => {
        if (a.type === "folder" && b.type === "file") return -1
        if (a.type === "file" && b.type === "folder") return 1
        return a.name.localeCompare(b.name)
    })
}



/************* 폴더 및 파일 생성 start******************/
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


/************* 폴더 및 파일 이동 start******************/
export function moveNode(nodePath: string, targetFolderPath: string, fileSystem: FolderNode): boolean {
    const nodeToMove: FileSystemNode | null = null
    const nodeParent: FolderNode | null = null

    // 노드와 그 부모를 찾는 헬퍼 함수
    function findNodeAndParent(
        node: FolderNode,
        path: string,
    ): { node: FileSystemNode | null; parent: FolderNode | null } {
        for (let i = 0; i < node.children.length; i++) {
            const child = node.children[i]

            if (child.path === path) {
                return { node: child, parent: node }
            }

            if (child.type === "folder") {
                const result = findNodeAndParent(child, path)
                if (result.node) return result
            }
        }

        return { node: null, parent: null }
    }

    const { node, parent } = findNodeAndParent(fileSystem, nodePath)
    if (!node || !parent) return false

    // 폴더를 자신의 하위 폴더로 이동하기 금지
    if (node.type === "folder" && targetFolderPath.startsWith(nodePath + "/")) {
        return false
    }

    // 대상 폴더 찾기
    const targetFolder = findFolder(targetFolderPath, fileSystem)
    if (!targetFolder) return false

    // 노드를 현재 부모에서 제거
    parent.children = parent.children.filter((child) => child.path !== nodePath)

    // 노드의 경로와 자식 노드의 경로 업데이트하기
    function updateNodePath(node: FileSystemNode, oldPath: string, newParentPath: string): void {
        const nodeName = node.name
        const newPath = newParentPath ? `${newParentPath}/${nodeName}` : nodeName

        node.path = newPath
        node.level = newParentPath.split('/').length
        node.depth = node.level + 1

        if (node.type === "folder") {
            node.children.forEach((child) => {
                updateNodePath(child, `${oldPath}/${child.name}`, newPath)
            })
        }
    }

    updateNodePath(node, nodePath, targetFolderPath)

    // 노드를 대상 폴더에 추가
    targetFolder.children.push(node)
    targetFolder.children = sortChildren(targetFolder.children)

    return true
}

/************* 폴더 및 파일 이동end******************/
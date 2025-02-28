/*
    파일 시스템 관련 유틸리티 함수 구현
    파일/폴더 추가, 이동, 이름 변경, 삭제, 내용 조회, 내용 수정 등의 기능을 제공
*/


interface FileNode {
    id: string
    name: string
    path: string
    content: string
    type: "file"
}

interface FolderNode {
    id: string
    name: string
    path: string
    type: "folder"
    children: (FileNode | FolderNode)[]
}

type FileSystemNode = FileNode | FolderNode


export function moveNode(nodePath: string, targetFolderPath: string, fileSystem: FolderNode): boolean {
    // 이동할 노드 찾기
    const nodeToMove: FileSystemNode | null = null
    const nodeParent: FolderNode | null = null

    // 노드오 그 부모를 찾는 헬퍼 함수
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

        if (node.type === "folder") {
            node.children.forEach((child) => {
                updateNodePath(child, `${oldPath}/${child.name}`, newPath)
            })
        }
    }

    updateNodePath(node, nodePath, targetFolderPath)

    // 노드를 대상 폴더에 추가
    targetFolder.children.push(node)

    return true
}

export function addFolder(parentPath: string, folderName: string, fileSystem: FolderNode): string | null {
    const parent = findFolder(parentPath, fileSystem)
    if (!parent) return null

    // 새로운 폴더 ID 생성
    const folderId = folderName.toLowerCase().replace(/[^a-z0-9]/g, "-")

    // 전체 경로 생성
    const folderPath = parentPath ? `${parentPath}/${folderName}` : folderName

    // 새로운 폴더 생성
    const newFolder: FolderNode = {
        id: folderId,
        name: folderName,
        path: folderPath,
        type: "folder",
        children: [],
    }

    // 폴더를 부모 폴더에 추가
    parent.children.push(newFolder)

    return folderPath
}

export function addFile(parentPath: string, fileName: string, content = "", fileSystem: FolderNode): string | null {
    const parent = findFolder(parentPath, fileSystem)
    if (!parent) return null

    // 새로운 파일 ID 생성
    const fileId = fileName.toLowerCase().replace(/[^a-z0-9]/g, "-")

    // 전체 경로 생성
    const filePath = parentPath ? `${parentPath}/${fileName}` : fileName

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
    }

    // 파일을 부모 폴더에 추가
    parent.children.push(newFile)

    return filePath
}

export function getFileContent(path: string, fileSystem: FolderNode): string | null {
    // 경로로 파일을 찾는 헬퍼 함수
    function findFile(node: FileSystemNode, targetPath: string): FileNode | null {
        if (node.type === "file" && node.path === targetPath) {
            return node
        }

        if (node.type === "folder") {
            for (const child of node.children) {
                const found = findFile(child, targetPath)
                if (found) return found
            }
        }

        return null
    }

    const file = findFile(fileSystem, path)
    return file ? file.content : null
}

export function updateFileContent(path: string, content: string, fileSystem: FolderNode): void {
    // 경로로 파일을 찾아 업데이트 하는 헬퍼 함수
    function findAndUpdateFile(node: FileSystemNode, targetPath: string): boolean {
        if (node.type === "file" && node.path === targetPath) {
            node.content = content
            return true
        }

        if (node.type === "folder") {
            for (const child of node.children) {
                if (findAndUpdateFile(child, targetPath)) return true
            }
        }

        return false
    }

    findAndUpdateFile(fileSystem, path)
}

export function renameFile(oldPath: string, newName: string, fileSystem: FolderNode): string | null {
    // 경로로 파일을 찾아 이름을 변경하는 헬퍼 함수
    function findAndRenameFile(node: FileSystemNode, targetPath: string): { success: boolean; newPath: string | null } {
        if (node.type === "file" && node.path === targetPath) {
            // 디렉토리 경로 가져오기
            const pathParts = node.path.split("/")
            pathParts.pop() // Remove the filename
            const dirPath = pathParts.join("/")

            // 새로운 경로 생성
            const newPath = dirPath ? `${dirPath}/${newName}` : newName

            // 파일 업데이트
            node.name = newName
            node.path = newPath

            return { success: true, newPath }
        }

        if (node.type === "folder") {
            for (const child of node.children) {
                const result = findAndRenameFile(child, targetPath)
                if (result.success) return result
            }
        }

        return { success: false, newPath: null }
    }

    const result = findAndRenameFile(fileSystem, oldPath)
    return result.newPath
}

export function deleteFile(path: string, fileSystem: FolderNode): boolean {
    // Helper function to find a file's parent folder
    function findParentFolder(node: FolderNode, targetPath: string): FolderNode | null {
        for (let i = 0; i < node.children.length; i++) {
            const child = node.children[i]

            if (child.type === "file" && child.path === targetPath) {
                return node
            }

            if (child.type === "folder") {
                const found = findParentFolder(child, targetPath)
                if (found) return found
            }
        }

        return null
    }

    const parent = findParentFolder(fileSystem, path)
    if (!parent) return false

    // Remove the file from its parent
    parent.children = parent.children.filter((child) => child.path !== path)
    return true
}

export function findFolder(path: string, fileSystem: FolderNode): FolderNode | null {
    if (path === "") return fileSystem

    function findFolderNode(node: FileSystemNode, targetPath: string): FolderNode | null {
        if (node.type === "folder" && node.path === targetPath) {
            return node
        }

        if (node.type === "folder") {
            for (const child of node.children) {
                const found = findFolderNode(child, targetPath)
                if (found) return found
            }
        }

        return null
    }

    return findFolderNode(fileSystem, path)
}

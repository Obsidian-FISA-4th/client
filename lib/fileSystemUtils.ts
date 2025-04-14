export interface FileNode {
    id: string;
    name: string;
    path: string;
    content: string;
    type: "file";
}

export interface FolderNode {
    id: string;
    name: string;
    path: string;
    type: "folder";
    children: (FileNode | FolderNode)[];
}

export interface FileSystemNode {
    id: string;
    name: string;
    type: "file" | "folder";
    path: string;
    children: FileSystemNode[];
    content?: string;
    publish?: boolean; 
}

export const transformApiResponse = (
    data: any[],
    isStudentPage?: boolean,
): FileSystemNode[] => {
    const excludedNames = [".DS_Store", "images", "public"];
    const transformed = data.map((item) => {
        if (excludedNames.includes(item.name)) return null;
        const children = transformApiResponse(item.children || [], isStudentPage);
        if (isStudentPage) {
            if (!item.folder && item.publish !== true) return null;
            if (item.folder && item.publish !== true && !children.length) return null;
        }
        return {
            id: item.path,
            name: item.name,
            type: item.folder ? "folder" : "file",
            path: item.path,
            publish: item.publish,
            children,
        };
    });
    return transformed.filter(Boolean) as FileSystemNode[];
};

export const transformApiResponseForDeployModal = (data: any[]): FileSystemNode[] => {
    const excludedNames = [".DS_Store", "images", "public"]; // 제외할 이름 목록
    return data
        .filter((item) => !excludedNames.includes(item.name)) // 제외할 이름 목록에 포함되지 않은 항목만 필터링
        .map((item) => ({
            id: item.path,
            name: item.name,
            type: item.folder ? "folder" : "file",
            path: item.path,
            children: transformApiResponseForDeployModal(item.children || []), // 재귀적으로 children 처리
        }));
};

export const getRelativePath = (fullPath: string, base: string): string => {
    return fullPath.startsWith(base) ? fullPath.substring(base.length) : fullPath;
};

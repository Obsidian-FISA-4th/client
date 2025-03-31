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
}


export const transformApiResponse = (data: any[]): FileSystemNode[] => {
    return data
        .filter((item) => item.name !== ".DS_Store" && item.name !== "images") // .DS_Store, images 폴더 파일 제외
        .map((item) => ({
            id: item.path,
            name: item.name,
            type: item.folder ? "folder" : "file",
            path: item.path,
            children: transformApiResponse(item.children || []),
        }));
};

export const getRelativePath = (fullPath: string, base: string): string => {
    return fullPath.startsWith(base) ? fullPath.substring(base.length) : fullPath;
};

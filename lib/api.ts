import axios from 'axios'

const API_KEY = process.env.API_KEY;
const BASE_URL = process.env.BASE_URL;


// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: BASE_URL + '/files',
  headers: {
    'X-API-KEY': API_KEY, 
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 쿠키 포함
});


// 파일 및 폴더 조회 api
export const fetchFileSystemData = async () => {
  try {
    const response = await apiClient.get('')
    return response.data.result
  } catch (error) {
    console.error('Error fetching file system:', error)
    throw error
  }
}

// 파일 또는 폴더 생성 api
export const createFileOrFolder = async (path: string, type: 'file' | 'folder') => {
  try {
    const response = await apiClient.post('/create', null, {
      params: { path, type }
    })
    return response.data
  } catch (error) {
    console.error('Error creating file or folder:', error)
    throw error
  }
}

// 파일 또는 폴더 이동 api
export const moveFileOrFolder = async (path: string, to: string) => {
  try {
    const response = await apiClient.put('/move', null, {
      params: { path, to }
    })
    return response.data
  } catch (error) {
    console.error('Error moving file or folder:', error)
    throw error
  }
}



// 이미지 로컬 저장 api
export const uploadImages = async (files: File[]): Promise<string[]> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  try {
    const response = await apiClient.post('/images', formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.result; // API에서 반환된 이미지 URL 배열
  } catch (error) {
    console.error("Error uploading images:", error);
    throw error;
  }
};

// 마크다운 저장 API
export const saveMarkdown = async (filePath:string, fileName: string, content: string): Promise<string> => {
  try {
    const response = await apiClient.post('/save', {
      filePath,
      fileName, // fileName으로 수정
      content,
    });
    return response.data.result; // 성공 메시지 반환
  } catch (error) {
    console.error("Error saving markdown:", error);
    throw error;
  }
};

// 파일 내용 읽기 API
export const fetchFileContent = async (filePath: string): Promise<string> => {
  try {
    const response = await apiClient.get('/content', {
      params: { path: filePath },
    });
    return response.data.result; // 파일 내용 반환
  } catch (error) {
    console.error("Error fetching file content:", error);
    throw error;
  }
};

// 파일 또는 폴더 삭제 API
export const deleteFileOrFolder = async (filePath: string): Promise<string> => {
  try {
    const response = await apiClient.delete('/delete', {
      params: { path: filePath },
    });
    return response.data.result; // 성공 메시지 반환
  } catch (error) {
    console.error("Error deleting file or folder:", error);
    throw error;
  }
};

// 파일 배포 API
export const publishFiles = async (filePaths: string[]): Promise<void> => {
  try {
    console.log("Publishing files:", filePaths); 
    await apiClient.post("/publish", { filePaths }); // filePaths로 변경
  } catch (error) {
    console.error("Error publishing files:", error);
    throw error;
  }
};



// 파일 회수 API
export const unpublishFiles = async (filePaths: string[]): Promise<void> => {
  try {
    await apiClient.delete("/unpublish", {
      data: { filePaths }, // filePaths로 변경
    });
  } catch (error) {
    console.error("Error unpublishing files:", error);
    throw error;
  }
};


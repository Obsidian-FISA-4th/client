import axios from 'axios'

const API_KEY = process.env.API_KEY;
const BASE_URL = process.env.BASE_URL;
const NG_URL = process.env.NG_URL; 


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
      // Nginx URL 반환
      const imageUrls = response.data.result.map((filePath: string) => {
        const fileName = filePath.split('/').pop(); // 파일명만 추출
        return `${NG_URL}/images/${fileName}`;
      });


    return imageUrls;
  } catch (error) {
    console.error("Error uploading images:", error);
    throw error;
  }
};

// 마크다운 수정 API
export const updateMarkdown = async (filePath:string, content: string): Promise<string> => {
  try {
    const response = await apiClient.put('/update', {
      filePath,
      content,
    });
    return response.data.result; // 성공 메시지 반환
  } catch (error) {
    console.error("Error saving markdown:", error);
    throw error;
  }
};

// 파일 이름 변경 API
export const renameFile = async (path: string, newName: string): Promise<string> => {
  try {
    const response = await apiClient.put('/rename', null, {
      params: { path, newName }, 
    });
    return response.data.result;
  } catch (error) {
    console.error("Error renaming file:", error);
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
    const relativePath = filePath.replace(process.env.HOME_DIR || "/default/note/", ""); // 상대 경로 추출
    const response = await apiClient.delete('/delete', {
      params: { path: relativePath },
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


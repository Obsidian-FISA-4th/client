import axios from 'axios'

const API_KEY = process.env.API_KEY;
const BASE_SRV_URL = process.env.BASE_SRV_URL;


// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: BASE_SRV_URL + '/files',
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
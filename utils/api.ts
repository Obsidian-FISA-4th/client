import axios from 'axios'

const API_KEY = process.env.API_KEY;


// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    'X-API-KEY': API_KEY, 
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 쿠키 포함
});


// 파일 및 폴더 조회 api
export const fetchFileSystemData = async () => {
  try {
    const response = await apiClient.get('/api/files')
    return response.data.result
  } catch (error) {
    console.error('Error fetching file system:', error)
    throw error
  }
}

// 파일 또는 폴더 생성 api
export const createFileOrFolder = async (path: string, type: 'file' | 'folder') => {
  try {
    const response = await apiClient.post('/api/files/create', null, {
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
    const response = await apiClient.put('/api/files/move', null, {
      params: { path, to }
    })
    return response.data
  } catch (error) {
    console.error('Error moving file or folder:', error)
    throw error
  }
}
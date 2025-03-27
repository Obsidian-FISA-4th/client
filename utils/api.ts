import axios from 'axios'

// 파일 및 폴더 조회 api
export const fetchFileSystemData = async () => {
  try {
    const response = await axios.get('/api/files')
    return response.data.result
  } catch (error) {
    console.error('Error fetching file system:', error)
    throw error
  }
}

// 파일 또는 폴더 생성 api
export const createFileOrFolder = async (path: string, type: 'file' | 'folder') => {
  try {
    const response = await axios.post('/api/files/create', null, {
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
    const response = await axios.put('/api/files/move', null, {
      params: { path, to }
    })
    return response.data
  } catch (error) {
    console.error('Error moving file or folder:', error)
    throw error
  }
}
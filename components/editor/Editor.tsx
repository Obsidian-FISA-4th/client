import { useState, useEffect } from "react"
import MDEditor from "@uiw/react-md-editor"
import { IconButtons } from "../ui/IconButton"
import { useDropzone } from "react-dropzone"

interface EditorProps {
  content: string
  onChange: (content: string) => void
  filePath?: string
  onDelete?: () => void
  onRename?: (oldPath: string, newName: string) => void;
  isStudent?: boolean; // 학생 여부를 나타내는 prop 추가
}

export function Editor({
  content,
  onChange,
  filePath,
  onDelete,
  onRename,
  isStudent = false, // 기본값은 false (관리자)
}: EditorProps) {
  const [editableContent, setEditableContent] = useState(content);
  const [editableTitle, setEditableTitle] = useState(filePath ? filePath.split("/").pop() || "" : "");
  const [isEditMode, setIsEditMode] = useState(isStudent ? false : true); // 관리자일 경우 기본적으로 편집 모드로 시작

  // 파일이 변경될 때 콘텐츠/제목 업데이트
  useEffect(() => {
    setEditableContent(content)
    setEditableTitle(filePath ? filePath.split("/").pop() || "" : "")
  }, [content, filePath])

  // 파일 수정 핸들러
  const handleContentChange = (value: string | undefined) => {
    if (value !== undefined) {
      setEditableContent(value)
      onChange(value)
    }
  }

  // 파일 수정 저장
  const handleSaveEdit = () => {
    onChange(editableContent);
  
    if (filePath && onRename && editableTitle !== filePath.split("/").pop()) {
      onRename(filePath, editableTitle);
    }

    alert("수정이 완료되었습니다!");
  };

  // 파일 삭제
  const handleDelete = () => {
    if (onDelete && window.confirm("Are you sure you want to delete this file?")) {
      onDelete()
    }
  }

  // 이미지 드래그 앤 드랍 처리
  const onDrop = (acceptedFiles: File[]) => {
    const newImages = acceptedFiles.map(file => URL.createObjectURL(file))
    const markdownImageTags = newImages.map(url => `![](${url})`).join("\n")
    setEditableContent(editableContent + "\n" + markdownImageTags)
    onChange(editableContent + "\n" + markdownImageTags)
  }

  // Dropzone 설정
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    noClick: true,
  })

  // 로컬 파일 선택 처리
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const newImages = Array.from(files).map(file => URL.createObjectURL(file))
      const markdownImageTags = newImages.map(url => `![](${url})`).join("\n")
      setEditableContent(editableContent + "\n" + markdownImageTags)
      onChange(editableContent + "\n" + markdownImageTags)
    }
  }

  // 로컬 파일 업로드 버튼 처리
  const handleUploadImage = () => {
    document.getElementById("fileInput")?.click()
  }

  if (!filePath) {
    return null
  }

  const isDarkMode = document.documentElement.classList.contains('dark')

  return (
    <div className="flex-1 overflow-auto bg-white dark:bg-[#1e1e1e] relative">
      <div className="flex justify-between p-2 border-b border-gray-200 dark:border-[#333]">
        <div className="text-sm text-gray-600 dark:text-[#999] flex items-center">
          {isEditMode ? (
            <input
              type="text"
              value={editableTitle}
              onChange={(e) => setEditableTitle(e.target.value)}
              className="px-2 py-1 bg-white dark:bg-[#333] border border-gray-300 dark:border-[#555] rounded text-gray-800 dark:text-[#dcddde] focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={isStudent} 
            />
          ) : (
            filePath.split("/").pop()
          )}
        </div>

        {!isStudent && (
          <IconButtons
            isEditMode={isEditMode}
            onEdit={() => setIsEditMode(true)}
            onSave={handleSaveEdit}
            onDelete={handleDelete}
            onUpload={handleUploadImage}
            disabled={isStudent} 
          />
        )}
      </div>

      {/* 편집 모드 */}
      {isEditMode ? (
        <div className="flex h-full overflow-auto">
          <div className="w-full overflow-auto sidebar-content">
            <div className="flex h-[calc(100vh-160px)]">
              <div {...getRootProps()} className="w-full overflow-auto sidebar-content">
                <input {...getInputProps()} />
                <MDEditor
                  value={editableContent}
                  onChange={handleContentChange}
                  height={800}
                  visiableDragbar={false}
                  data-color-mode={isDarkMode ? "light" : "dark"}
                />
                {/* 로컬 파일 선택 버튼 */}
                <div className="mt-4">
                  <input
                    id="fileInput"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    multiple
                    disabled={isStudent} 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* 보기 모드 */
        <div className="p-4 overflow-auto h-[calc(100vh-160px)] sidebar-content">
          <div className="max-w-3xl mx-auto prose dark:prose-invert">
            <MDEditor.Markdown
              source={editableContent}
              className="prose dark:prose-invert text-black dark:text-white"
              style={{ backgroundColor: "transparent"}}/>
          </div>
        </div>
      )}
    </div>
  )
}



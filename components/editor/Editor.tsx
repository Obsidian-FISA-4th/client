import { useState, useEffect } from "react"
import MDEditor from "@uiw/react-md-editor"
import { IconButtons } from "../ui/IconButton"
import { useDropzone } from "react-dropzone"
import { useFileSystemStore } from "@/store/fileSystemStore";


interface EditorProps {
  content: string
  onChange: (content: string) => void
  filePath?: string
  onDelete?: () => void
  onRename?: (oldPath: string, newName: string) => void;
  isStudent?: boolean;
  isDarkMode: boolean
  toggleDarkMode: () => void

}

export function Editor({
  content,
  onChange,
  filePath,
  onDelete,
  onRename,
  isStudent = false,
  isDarkMode,
  toggleDarkMode,
}: EditorProps) {
  const {
    handleFileRename, // 이름 수정: handleRenameFile -> handleFileRename
    handleUpdateFileContent,
    handleDeleteFile,
  } = useFileSystemStore();
  const [editableContent, setEditableContent] = useState(content);
  const [editableTitle, setEditableTitle] = useState(filePath ? filePath.split("/").pop() || "" : "");
  const [isEditMode, setIsEditMode] = useState(isStudent ? false : true);
  const [localImages, setLocalImages] = useState<File[]>([]);

  // 파일이 변경될 때 콘텐츠/제목 업데이트
  useEffect(() => {
    setEditableContent(content || ""); // content가 undefined일 경우 빈 문자열로 초기화
    setEditableTitle(filePath ? filePath.split("/").pop()?.replace(/\.md$/, "") || "" : ""); // .md 확장자 제거
    setIsEditMode(!isStudent);
  }, [content, filePath, isStudent]);

  // 파일 수정 저장
  const handleSaveEdit = async () => {
    if (!filePath) return; // filePath가 undefined일 경우 처리

    const fileName = filePath.split("/").pop() || ""; // 파일 이름 추출

    // 파일 이름 변경
    if (editableTitle !== fileName.replace(/\.md$/, "")) { // .md 확장자 제거 후 비교
      handleFileRename(filePath, `${editableTitle}.md`); // 저장 시 .md 확장자 추가
    }

    // 파일 내용 업데이트 및 저장
    await handleUpdateFileContent(filePath, editableContent);

    // 로컬 이미지 초기화
    setLocalImages([]);
    setIsEditMode(false);
  };

  // 파일 삭제
  const handleDelete = () => {
    if (filePath && window.confirm("Are you sure you want to delete this file?")) {
      handleDeleteFile(); // filePath는 store에서 처리
    }
  };

  // 이미지 드래그 앤 드랍 처리
  const onDrop = (acceptedFiles: File[]) => {
    const newImages = acceptedFiles.map((file) => URL.createObjectURL(file));
    const markdownImageTags = newImages.map((url) => `![](${url})`).join("\n");
    const updatedContent = editableContent + "\n" + markdownImageTags;

    setLocalImages((prev) => [...prev, ...acceptedFiles]);
    setEditableContent(updatedContent);
    if (filePath) {
      handleUpdateFileContent(filePath, updatedContent); // 파일 내용 업데이트
    }
  };

  // Dropzone 설정
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    noClick: true,
  })

  // 로컬 파일 선택 처리
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const fileArray = Array.from(files);
      setLocalImages((prev) => [...prev, ...fileArray]); // 로컬 이미지 추가
      const newImages = Array.from(files).map(file => URL.createObjectURL(file))
      const markdownImageTags = newImages.map(url => `![](${url})`).join("\n")
      const updatedContent = editableContent + "\n" + markdownImageTags;
      setEditableContent(updatedContent);
      if (filePath) {
        handleUpdateFileContent(filePath, updatedContent); // 파일 내용 업데이트
      }
    }
  }

  // 로컬 파일 업로드 버튼 처리
  const handleUploadImage = () => {
    document.getElementById("fileInput")?.click()
  }

  if (!filePath) {
    return null
  }

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
                  onChange={(value) => setEditableContent(value || "")}
                  height={800}
                  visiableDragbar={false}
                  data-color-mode={isDarkMode ? "dark" : "light"}
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
              style={{ backgroundColor: "transparent" }} />
          </div>
        </div>
      )}
    </div>
  )
}

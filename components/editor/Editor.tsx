import { useState, useEffect } from "react"
import MDEditor from "@uiw/react-md-editor"
import { useDropzone } from "react-dropzone"
import { useFileSystemStore } from "@/store/fileSystemStore";
import { EditorSubmenu } from "./EditorSubMenu"
import {useRef} from "react";
import { uploadImages } from "@/lib/api"; 


interface EditorProps {
  content: string
  onChange: (content: string) => void
  filePath?: string
  onDelete?: (path: string, type: "file" | "folder") => Promise<void>;  onRename?: (oldPath: string, newName: string) => void;
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
    handleUpdateFileContent,
    handleDeleteFile,
  } = useFileSystemStore();
  const [editableContent, setEditableContent] = useState(content);
  const [editableTitle, setEditableTitle] = useState(filePath ? filePath.split("/").pop()?.replace(/\.md$/, "") || "" : "");
  const [isEditMode, setIsEditMode] = useState(isStudent ? false : true);
  const editorRef = useRef<HTMLTextAreaElement | null>(null);

  // 파일이 변경될 때 콘텐츠/제목 업데이트
  useEffect(() => {
    setEditableContent(content || "");
    setEditableTitle(filePath ? filePath.split("/").pop()?.replace(/\.md$/, "") || "" : "");
    setIsEditMode(!isStudent);
  }, [content, filePath, isStudent]);

  // 파일 수정 저장
  const handleSaveEdit = async () => {
    if (!filePath) return;

    await handleUpdateFileContent(filePath, editableContent);
    setIsEditMode(false);
  };

  // 파일 삭제
  const handleDelete = () => {
    if (filePath && window.confirm("Are you sure you want to delete this file?")) {
      handleDeleteFile(filePath, "file"); // filePath와 추가 인자를 전달
    }
  };

    // 이미지 삽입 함수
    const insertImageAtCursor = (imageMarkdown: string) => {
      if (editorRef.current) {
        const textarea = editorRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const before = editableContent.slice(0, start);
        const after = editableContent.slice(end);
        const newContent = `${before}${imageMarkdown}${after}`;
        setEditableContent(newContent);
        textarea.setSelectionRange(start + imageMarkdown.length, start + imageMarkdown.length);
        textarea.focus();
      } else {
        setEditableContent((prev) => prev + imageMarkdown);
      }
    };


  // 이미지 드래그 앤 드랍 처리
  const onDrop = async (acceptedFiles: File[]) => {
    try {
      const uploadedImageUrls = await uploadImages(acceptedFiles); // API 호출
      uploadedImageUrls.forEach((url) => {
        const markdownImageTag = `![](${url})`;
        insertImageAtCursor(markdownImageTag); // 커서 위치에 이미지 삽입
      });
    } catch (error) {
      console.error("Error uploading images:", error);
    }
  };

  // Dropzone 설정
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    noClick: true,
  });


 // 로컬 파일 선택 처리
 const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const files = event.target.files;
  if (files) {
    try {
      const fileArray = Array.from(files);
      const uploadedImageUrls = await uploadImages(fileArray); // API 호출
      uploadedImageUrls.forEach((url) => {
        const markdownImageTag = `![](${url})`;
        insertImageAtCursor(markdownImageTag); // 커서 위치에 이미지 삽입
      });
    } catch (error) {
      console.error("Error uploading images:", error);
    }
  }
};

  // 로컬 파일 업로드 버튼 처리
  const handleUploadImage = () => {
    document.getElementById("fileInput")?.click();
  };

  if (!filePath) {
    return null;
  }

  return (
    <div className="flex-1  bg-white dark:bg-[#1e1e1e] relative">
      <EditorSubmenu
        editableTitle={editableTitle}
        setEditableTitle={setEditableTitle}
        isEditMode={isEditMode}
        setIsEditMode={setIsEditMode}
        handleSaveEdit={handleSaveEdit}
        handleDelete={handleDelete}
        handleUploadImage={handleUploadImage}
        isStudent={isStudent}
        filePath={filePath}
      />

      {/* 편집 모드 */}
      {isEditMode ? (
        <div {...getRootProps()} className="w-full h-full overflow-auto">
          <input {...getInputProps()} />
          <MDEditor
            value={editableContent}
            onChange={(value) => setEditableContent(value || "")}
            height={800}
            visibleDragbar={false}
            data-color-mode={isDarkMode ? "dark" : "light"}
            className="custom-md-editor"
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
      ) : (
        /* 보기 모드 */
        <div className="p-4 overflow-auto h-[calc(100vh-160px)]">
          <div className="max-w-3xl mx-auto prose dark:prose-invert">
            <MDEditor.Markdown
              source={editableContent}
              className="prose dark:prose-invert text-black dark:text-white"
              style={{ backgroundColor: "transparent" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
import { useState, useEffect, useRef } from "react";
import MDEditor from "@uiw/react-md-editor";
import { useDropzone } from "react-dropzone";
import { useFileSystemStore } from "@/store/fileSystemStore";
import { uploadImages } from "@/lib/api";
import { IconButtons } from "../ui/IconButton";

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  filePath?: string;
  onDelete?: (path: string, type: "file" | "folder") => Promise<void>;
  onRename?: (oldPath: string, newName: string) => void;
  isStudent?: boolean;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isDeployModalOpen: boolean;
}

export function Editor({
  content,
  filePath,
  isStudent = false,
  isDarkMode,
  isDeployModalOpen,
}: EditorProps) {
  const {
    handleUpdateFileContent,
    handleDeleteFile,
    handleFileRename,
    handleFileClick,
    fileContent,
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

  useEffect(() => {
    // filePath가 있을 때마다 파일 내용을 fetch
    if (filePath) {
      handleFileClick(filePath);
    }
  }, [filePath, handleFileClick]);


  // 파일 수정 저장
  const handleSaveEdit = async () => {
    if (!filePath) return;

    const oldFileName = filePath.split("/").pop() || "";
    const oldDir = filePath.split("/").slice(0, -1).join("/");
    const newFileName = `${editableTitle}.md`;
    const newPath = `${oldDir}/${newFileName}`;

    if (editableTitle !== oldFileName.replace(/\.md$/, "")) {
      await handleFileRename(filePath, newFileName);
    }

    const targetPath = editableTitle !== oldFileName.replace(/\.md$/, "")
      ? newPath
      : filePath;

    await handleUpdateFileContent(targetPath, editableContent);

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
    <div
      className={`flex-1 w-full placeholder:flex flex-col bg-white dark:bg-[#1e1e1e] ${!isEditMode ? "overflow-auto" : ""
        }`}
    >
      <div
        className={`flex-none flex  justify-between p-2 border-b border-gray-200 dark:border-[#333]  ${isDeployModalOpen
          ? "pointer-events-none opacity-50 bg-gray-200 dark:bg-gray-800"
          : "bg-white dark:bg-[#1e1e1e]"
          } z-0`}
      >
        <div className="text-sm text-gray-600 dark:text-[#999] flex items-center">
          {isEditMode ? (
            <input
              type="text"
              value={editableTitle}
              onChange={(e) => setEditableTitle(e.target.value)}
              className="px-2 py-1 bg-white dark:bg-[#333] border border-gray-300 dark:border-[#555] rounded text-gray-800 dark:text-[#dcddde] focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={isStudent || isDeployModalOpen}
            />
          ) : (
            filePath?.split("/").pop()?.replace(/\.md$/, "")
          )}
        </div>

        {!isStudent && (
          <IconButtons
            isEditMode={isEditMode}
            onEdit={() => setIsEditMode(true)}
            onSave={handleSaveEdit}
            onDelete={handleDelete}
            onUpload={handleUploadImage}
            disabled={isStudent || isDeployModalOpen}
          />
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {isEditMode ? (
          <div {...getRootProps()} className="w-full h-full">
            <input {...getInputProps()} />
            <MDEditor
              value={editableContent}
              onChange={(value) => setEditableContent(value || "")}
              visibleDragbar={false}
              data-color-mode={isDarkMode ? "dark" : "light"}
              className="custom-md-editor"
            />
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
          // 읽기 전용 모드
          <div className="flex flex-col h-full">
            <div className="p-4 flex-1 min-h-0 overflow-y-auto">
              <div
                className="
        max-w-3xl mx-auto
        prose dark:prose-invert
        prose-headings:text-black prose-p:text-black prose-li:text-black prose-a:text-black 
        dark:prose-headings:text-white dark:prose-p:text-white dark:prose-li:text-white dark:prose-a:text-white
      "
              >
                <MDEditor.Markdown
                  source={fileContent}
                  style={{ backgroundColor: "transparent" }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
'use client';

import { useState } from "react";
import { useRouter } from "next/router";
import { AuthModal } from "@/components/modals/AuthModal";
import dotenv from 'dotenv';

// 환경변수 로드
dotenv.config();

function MainContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isStudent, setIsStudent] = useState(false); // 권한 상태 추가
  const router = useRouter();

  const handleAuthenticate = (role: string) => {
    setIsAuthenticated(true);
    setIsStudent(role === "student");
    if (role === "student") {
      router.push("/student");
    } else {
      router.push("/admin");
    }
  };

  if (!isAuthenticated) {
    return <AuthModal onAuthenticate={handleAuthenticate} />;
  }

  return null; // 인증 후 리다이렉트되므로 아무것도 렌더링하지 않음
}

export default function ObsidianClone() {
  return <MainContent />;
}
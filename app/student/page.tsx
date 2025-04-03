"use client";

import { useState } from "react";
import '../styles/globals.css'
import { useRouter } from "next/navigation";
import { CommonLayout } from "@/components/layout/CommonLayout";
import { AuthModal } from "@/components/modals/AuthModal";

export default function StudentPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  const handleAuthenticate = (role: string) => {
    if (role === "student") {
      setIsAuthenticated(true);
    } else {
      alert("Invalid role");
    }
  };

  if (!isAuthenticated) {
    return <AuthModal onAuthenticate={handleAuthenticate} />;
  }

  return <CommonLayout isStudent={true} isStudentPage={true} />;
}
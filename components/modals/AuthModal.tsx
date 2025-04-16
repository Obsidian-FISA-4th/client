'use client'

import { useState, useEffect } from "react"

interface AuthModalProps {
  onAuthenticate: (role: string) => void
}

export function AuthModal({ onAuthenticate }: AuthModalProps) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Check if user is already authenticated via cookie
    const checkAuth = () => {
      const isAuthenticated = document.cookie.includes("obsidian_auth=true")
      if (isAuthenticated) {
        onAuthenticate("student")
      }
      setIsChecking(false)
    }

    checkAuth()
  }, [onAuthenticate])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (password === "0119") {
      // Set cookie to expire in 7 days
      const expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + 7)
      document.cookie = `obsidian_auth=true; expires=${expiryDate.toUTCString()}; path=/`

      onAuthenticate("student")
    } else {
      setError("Incorrect password. Please try again.")
      setPassword("")
    }
  }

  if (isChecking) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-[#0d1116] flex items-center justify-center z-50">
        <div className="w-full max-w-md p-8 rounded-lg shadow-lg bg-white dark:bg-[#262626]">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-white dark:bg-[#0d1116] flex items-center justify-center z-50">
      <div className="w-full max-w-md p-8 rounded-lg shadow-lg bg-white dark:bg-[#262626]">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-[#dcddde]">
          Authentication Required
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-[#999] mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-md bg-white dark:bg-[#333] text-gray-800 dark:text-[#dcddde] border-gray-300 dark:border-[#444] focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter password"
              autoFocus
            />
            {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  )
}
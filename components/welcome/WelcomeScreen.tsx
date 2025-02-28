export function WelcomeScreen() {
  return (
    <div className="flex-1 overflow-auto bg-white dark:bg-[#1e1e1e] flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold mb-6 text-gray-800 dark:text-[#dcddde]">Welcome to Your Knowledge Vault</h1>

        <p className="text-xl mb-8 text-gray-600 dark:text-[#999]">
          Your personal space for notes, ideas, and knowledge management.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          <div className="p-6 bg-gray-50 dark:bg-[#262626] rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-3 text-gray-800 dark:text-[#dcddde]">Getting Started</h2>
            <p className="text-gray-600 dark:text-[#999]">
              Select a file from the sidebar to start viewing or editing your notes.
            </p>
          </div>

          <div className="p-6 bg-gray-50 dark:bg-[#262626] rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-3 text-gray-800 dark:text-[#dcddde]">Organize Your Thoughts</h2>
            <p className="text-gray-600 dark:text-[#999]">
              Use the folder structure to keep your notes organized and easily accessible.
            </p>
          </div>

          <div className="p-6 bg-gray-50 dark:bg-[#262626] rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-3 text-gray-800 dark:text-[#dcddde]">Markdown Support</h2>
            <p className="text-gray-600 dark:text-[#999]">
              Format your notes with Markdown syntax for rich text formatting.
            </p>
          </div>

          <div className="p-6 bg-gray-50 dark:bg-[#262626] rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-3 text-gray-800 dark:text-[#dcddde]">Search Functionality</h2>
            <p className="text-gray-600 dark:text-[#999]">
              Quickly find your notes using the search feature in the sidebar.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}


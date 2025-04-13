type TopbarProps = {
  toggleDarkMode: () => void;
};

export const Topbar = ({ toggleDarkMode }: TopbarProps) => {
    return (
        <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-800 shadow">
            <h1 className="text-xl font-bold">Ollama Chat</h1>
            <button
                onClick={toggleDarkMode}
                className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700"
            >
                Toggle Theme
            </button>
        </div>
    );
};
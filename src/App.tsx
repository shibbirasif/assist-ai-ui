import { useState } from "react";
import { Topbar } from "./components/Topbar";
import { ChatWindow } from "./components/ChatWindow";
import { Sidebar } from "./components/Sidebar";

export const App = () => {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
        <Sidebar />
        <div className="flex flex-col flex-1">
          <Topbar toggleDarkMode={() => setDarkMode(!darkMode)} />
          <ChatWindow />
        </div>
      </div>
    </div>
  );
}
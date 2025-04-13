import { useState, useEffect } from 'react';
import { fetchChatSessions } from '../api/chatSessions';
import { ChatSession } from "../dto/ChatSession";

export const Sidebar = () => {
    const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadChatSessions = async () => {
            try {
                setIsLoading(true);
                const data = await fetchChatSessions();
                setChatSessions(data);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch chat sessions:', err);
                setError('Failed to load chats. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        loadChatSessions();
    }, []);

    const handleChatSelect = (chatId: string) => {
        console.log(`Selected chat: ${chatId}`);
        // You can add navigation or state updates here
    };

    return (
        <div className="w-64 bg-gray-200 dark:bg-gray-800 p-4 hidden md:block">
            <h2 className="font-semibold mb-4">Chats</h2>

            {isLoading && <p className="text-gray-500">Loading chats...</p>}

            {error && <p className="text-red-500">{error}</p>}

            {!isLoading && !error && (
                chatSessions.length > 0 ? (
                    <ul>
                        {chatSessions.map((chat) => (
                            <li
                                key={chat.id}
                                className="py-2 px-3 rounded hover:bg-gray-300 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                                onClick={() => handleChatSelect(chat.id)}
                            >
                                {chat.title || `Chat ${chat.id}`}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500">No chats found</p>
                )
            )}
        </div>
    );
};

import { useEffect, useState } from 'react';
import { useChatSocket } from '../hooks/useChatSocket'; // assuming useChatSocket is exported from this path
import { createChatSession, fetchChatSession } from '../api/chatSessions'; // assuming the API functions are exported from this path
import { Message } from '../dto/Message';

type ChatWindowProps = {
  chatSessionId: string | null;
}

export const ChatWindow = ({ chatSessionId }: ChatWindowProps) => {
    const [sessionId, setSessionId] = useState<string | null>(chatSessionId);
    const [title, setTitle] = useState<string>('');
    const [messages, setMessages] = useState<Message[]>([]);
    const { messages: socketMessages, isConnected, sendMessage } = useChatSocket(sessionId);

    useEffect(() => {
        if (sessionId) {
            // Fetch existing chat session if sessionId is provided
            const fetchSession = async () => {
                try {
                    const session = await fetchChatSession(sessionId);
                    setTitle(session.title);
                    setMessages(session.messages);
                } catch (error) {
                    console.error('Error fetching chat session:', error);
                }
            };
            fetchSession();
        } else {
            // Create new chat session if sessionId is not available
            const createSession = async () => {
                try {
                    const newSession = await createChatSession( 'New Chat',  'ollama' );
                    setSessionId(newSession.id);
                    setTitle(newSession.title);
                    setMessages(newSession.messages);
                } catch (error) {
                    console.error('Error creating chat session:', error);
                }
            };
            createSession();
        }
    }, [sessionId]);

    useEffect(() => {
        // Listen to WebSocket messages and update the messages state
        if (socketMessages && socketMessages.length > 0) {
            setMessages((prevMessages) => [...prevMessages, ...socketMessages]);
        }
    }, [socketMessages]);

    const handleSendMessage = (message: string) => {
        if (message && isConnected) {
            sendMessage(message);
        }
    };

    return (
        <div className="flex-1 flex flex-col justify-between p-4 overflow-y-auto">
            <div className="flex-1">
                {/* Chat messages go here */}
                {messages.length > 0 ? (
                    messages.map((msg, index) => (
                        <p key={index} className={msg.role === 'user' ? 'text-left' : 'text-right'}>
                            <strong>{msg.role === 'user' ? 'User' : 'AI'}: </strong>{msg.content}
                        </p>
                    ))
                ) : (
                    <p>No messages yet...</p>
                )}
            </div>
            <div className="mt-4">
                <input
                    type="text"
                    placeholder="Type a message..."
                    className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                            handleSendMessage(e.currentTarget.value.trim());
                            e.currentTarget.value = ''; // Clear input after sending
                        }
                    }}
                />
            </div>
        </div>
    );
};

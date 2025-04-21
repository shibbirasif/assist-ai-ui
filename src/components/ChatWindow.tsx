import { useEffect, useRef, useState } from 'react';
import { useChatSocket } from '../hooks/useChatSocket';
import { createChatSession, fetchChatSession } from '../api/chatSessions';
import { Message } from '../dto/Message';

type ChatWindowProps = {
    chatSessionId: string | null;
};

export const ChatWindow = ({ chatSessionId }: ChatWindowProps) => {
    const [sessionId, setSessionId] = useState<string | null>(chatSessionId);
    const [title, setTitle] = useState<string>('New Chat');
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isFirstMessage, setIsFirstMessage] = useState(true);

    const { messages: socketMessages, isConnected, sendMessage } = useChatSocket(sessionId);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        // Only fetch existing session if chatSessionId is passed
        if (chatSessionId) {
            const fetchSession = async () => {
                try {
                    const session = await fetchChatSession(chatSessionId);
                    setTitle(session.title);
                    setMessages(session.messages);
                } catch (error) {
                    console.error('Error fetching chat session:', error);
                }
            };
            fetchSession();
        }
    }, [chatSessionId]);

    useEffect(() => {
        if (socketMessages.length > 0) {
            setMessages((prev) => [...prev, ...socketMessages]);
        }
    }, [socketMessages]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        try {
            if (!sessionId) {
                const newSession = await createChatSession('New Chat @' + new Date().toISOString(), 'llama3.2:3b');
                setSessionId(newSession.id);
                setTitle(newSession.title);
            }

            setMessages((prev) => [...prev, { role: 'user', content: input.trim() }]);
            sendMessage(input.trim());
            setInput('');
            setIsFirstMessage(false);
        } catch (err) {
            console.error('Failed to send message:', err);
        }
    };

    return (
        <div className="flex-1 flex flex-col justify-between p-4 overflow-y-auto">
            <div className="flex-1 space-y-2 overflow-y-auto">
                {messages.length > 0 ? (
                    messages.map((msg, index) => (
                        <p
                            key={index}
                            className={`${msg.role === 'user' ? 'text-left' : 'text-right'
                                }`}
                        >
                            <strong>{msg.role === 'user' ? 'User' : 'AI'}:</strong> {msg.content}
                        </p>
                    ))
                ) : (
                    <p className="text-gray-500">No messages yet...</p>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="mt-4">
                <div className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    Connection status:{" "}
                    <span className={isConnected ? 'text-green-500' : 'text-red-500'}>
                        {isConnected ? 'Connected' : 'Disconnected'}
                    </span>
                </div>
                <input
                    type="text"
                    value={input}
                    placeholder="Type a message..."
                    className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleSend();
                        }
                    }}
                />
            </div>
        </div>
    );
};

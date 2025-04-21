import { useEffect, useRef, useState, useCallback } from 'react';
import { useChatSocket } from '../hooks/useChatSocket';
import { createChatSession, fetchChatSession } from '../api/chatSessions';
import { Message } from '../dto/Message';
import ReactMarkdown from 'react-markdown';

type ChatWindowProps = {
    chatSessionId: string | null;
};

export const ChatWindow = ({ chatSessionId }: ChatWindowProps) => {
    const [sessionId, setSessionId] = useState<string | null>(chatSessionId);
    const [_title, setTitle] = useState('New Chat');
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [pendingMessage, setPendingMessage] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const handleStreamChunk = useCallback((chunk: Message) => {
        setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.role === 'assistant' && last.stream !== '[DONE]') {
                return [
                    ...prev.slice(0, -1),
                    {
                        ...last,
                        content: last.content + chunk.content,
                        stream: chunk.stream,
                    },
                ];
            }
            return [...prev, chunk];
        });
    }, []);

    const handleStreamDone = useCallback(() => {
        setMessages((prev) =>
            prev.map((msg, index) =>
                index === prev.length - 1 ? { ...msg, stream: '[DONE]' } : msg
            )
        );
    }, []);

    const { isConnected, sendMessage } = useChatSocket(sessionId, handleStreamChunk, handleStreamDone);

    useEffect(() => {
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
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Send pending message after connection is ready
    useEffect(() => {
        if (sessionId && isConnected && pendingMessage) {
            sendMessage(pendingMessage);
            setPendingMessage(null);
        }
    }, [sessionId, isConnected, pendingMessage, sendMessage]);

    const handleSend = async () => {
        if (!input.trim()) return;

        try {
            let currentSessionId = sessionId;

            if (!currentSessionId) {
                const newSession = await createChatSession(
                    'New Chat @' + new Date().toISOString(),
                    'llama3.2:3b'
                );
                currentSessionId = newSession.id;
                setSessionId(newSession.id);
                setTitle(newSession.title);
            }

            // Add user message immediately
            setMessages((prev) => [
                ...prev,
                { role: 'user', content: input.trim() },
            ]);

            // Send or queue the message
            if (isConnected && currentSessionId === sessionId) {
                sendMessage(input.trim());
            } else {
                setPendingMessage(input.trim());
            }

            setInput('');
        } catch (err) {
            console.error('Failed to send message:', err);
        }
    };

    return (
        <div className="flex-1 flex flex-col justify-between p-4 overflow-y-auto">
            <div className="flex-1 space-y-2 overflow-y-auto">
                {messages.length > 0 ? (
                    messages.map((msg, index) => (
                        <div
                            id={String(index)}
                            key={index}
                            className={`${msg.role === 'user' ? 'text-left' : 'text-right'}`}
                        >
                            <strong>{msg.role === 'user' ? 'User' : 'AI'}:</strong>{' '}
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500">No messages yet...</p>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="mt-4">
                <div className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    Connection status:{' '}
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

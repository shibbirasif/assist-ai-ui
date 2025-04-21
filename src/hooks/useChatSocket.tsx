import { useEffect, useRef, useState } from 'react';
import { Message } from '../dto/Message';

const WEBSOCKET_URL = import.meta.env.VITE_API_BASE_URL;

export const useChatSocket = (chatSessionId: string | null) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);
    const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!chatSessionId) return;

        const ws = new WebSocket(`${WEBSOCKET_URL}?chatSessionId=${chatSessionId}`);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log('WebSocket connected');
            setIsConnected(true);

            // Start ping interval
            pingIntervalRef.current = setInterval(() => {
                if (ws.readyState === WebSocket.OPEN) {
                    console.log('Sending Ping');
                    ws.send(JSON.stringify({ type: 'ping' }));
                }
            }, 30000);
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'pong') {
                    console.log('Received Pong');
                    return;
                }

                console.log('Received message:', data);
                if (data.content !== undefined) {
                    setMessages((prev) => {

                        const lastMessage = prev[prev.length - 1];
                        if (lastMessage && lastMessage.role === 'assistant' && lastMessage.stream !== '[DONE]') {
                            return [
                                ...prev.slice(0, -1),
                                {
                                    ...lastMessage,
                                    content: lastMessage.content + data.content,
                                    stream: data.stream,
                                },
                            ];
                        } else {
                            return [
                                ...prev,
                                {
                                    role: data.role,
                                    content: data.content,
                                    stream: data.stream,
                                    images: data.images,
                                },
                            ];
                        }

                    });
                } else {
                    console.warn('Unexpected message format:', data);
                }
                console.log('messages:', messages.length);
            } catch (err) {
                console.error('Error parsing message:', err);
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        ws.onclose = () => {
            console.log('WebSocket disconnected');
            setIsConnected(false);
            if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        };

        return () => {
            if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
            if (wsRef.current) wsRef.current.close();
        };
    }, [chatSessionId]);

    const sendMessage = (message: string) => {
        const ws = wsRef.current;
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'message', message }));
        } else {
            console.warn('WebSocket is not open. Cannot send message.');
        }
    };

    return { messages, isConnected, sendMessage };
};

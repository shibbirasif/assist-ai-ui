import { useEffect, useRef, useState } from 'react';
import { Message } from '../dto/Message';

const WEBSOCKET_URL = import.meta.env.VITE_API_BASE_URL;

export const useChatSocket = (
    chatSessionId: string | null,
    onMessageChunk: (msg: Message) => void,
    onMessageDone?: () => void
) => {
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
            pingIntervalRef.current = setInterval(() => {
                ws.send(JSON.stringify({ type: 'ping' }));
            }, 30000);
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'pong') return;

                if (data.stream === '[DONE]') {
                    onMessageDone?.();
                    return;
                }

                if (data.content !== undefined) {
                    const msg: Message = {
                        role: data.role || 'assistant',
                        content: data.content,
                        stream: data.stream,
                        images: data.images,
                    };
                    onMessageChunk(msg);
                }
            } catch (err) {
                console.error('WebSocket message error:', err);
            }
        };

        ws.onclose = () => {
            console.log('WebSocket closed');
            setIsConnected(false);
            if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        };

        ws.onerror = (err) => {
            console.error('WebSocket error:', err);
        };

        return () => {
            if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
            ws.close();
        };
    }, [chatSessionId]);

    const sendMessage = (message: string) => {
        const ws = wsRef.current;
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'message', message }));
        } else {
            console.warn('WebSocket not open');
        }
    };

    return { isConnected, sendMessage };
};

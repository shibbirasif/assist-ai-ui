import { useEffect, useRef, useState } from 'react';
import { Message } from '../dto/Message';

const WEBSOCKET_URL = '/message'; // Replace with your actual full WebSocket URL if needed

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

        if (data.role && data.message) {
          setMessages((prev) => [
            ...prev,
            { role: data.role, content: data.message },
          ]);
        } else {
          console.warn('Unexpected message format:', data);
        }
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

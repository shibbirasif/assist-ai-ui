import { useEffect, useRef, useState } from 'react';
import { Message } from '../dto/Message';

const WEBSOCKET_URL = '/message'; // replace with your WebSocket URL

export const useChatSocket = (chatSessionId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (chatSessionId) {
      wsRef.current = new WebSocket(`${WEBSOCKET_URL}?chatSessionId=${chatSessionId}`);

      const ws = wsRef.current;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        clearInterval(pingIntervalRef.current as NodeJS.Timeout);
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'pong') {
          console.log('Received Pong');
        } else {
          setMessages((prevMessages) => [
            ...prevMessages,
            { role: data.role, message: data.message },
          ]);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      pingIntervalRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          console.log('Sending Ping');
          ws.send(JSON.stringify({ type: 'ping' }));
        }
      }, 30000); // every 30 seconds

      return () => {
        if (wsRef.current) {
          wsRef.current.close();
        }
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
        }
      };
    }

    return () => {
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [chatSessionId]);

  const sendMessage = (message: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'message', message }));
    }
  };

  return { messages, isConnected, sendMessage };
};

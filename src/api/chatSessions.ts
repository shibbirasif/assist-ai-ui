import { ChatSession } from "../dto/ChatSession";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Fetches all chat sessions from the API
 * @returns Promise containing an array of ChatSession objects
 */
export const fetchChatSessions = async (): Promise<ChatSession[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/chat-sessions`);
        if (!response.ok) {
            throw new Error(`Failed to fetch chat sessions: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching chat sessions:', error);
        throw error;
    }
};
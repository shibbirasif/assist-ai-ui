import { ChatSession } from "../dto/ChatSession";


/**
 * Fetches all chat sessions from the API
 * @returns Promise containing an array of ChatSession objects
 */
export const fetchChatSessions = async (): Promise<ChatSession[]> => {
    const response = await fetch('/chat-sessions');
    if (!response.ok) {
        throw new Error('Failed to fetch chat sessions');
    }
    return response.json();
};
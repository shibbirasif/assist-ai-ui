import { API_PATHS } from "../constants/apiPaths";
import { ChatSession } from "../dto/ChatSession";
import { ChatSessionDetails } from "../dto/ChatSessionDetails";
import { apiClient } from "../lib/apiClient";

export const fetchChatSessions = async (): Promise<ChatSession[]> => {
    return await apiClient<ChatSession[]>(API_PATHS.listChatSessions);
};

export async function fetchChatSession(id: string): Promise<ChatSessionDetails> {
    return await apiClient<ChatSessionDetails>(API_PATHS.getChatSession(id));
}

export async function createChatSession(title: string, model: string): Promise<ChatSessionDetails> {
    try {
        const res = await fetch(API_PATHS.createChatSession, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, model }),
        });

        if (!res.ok) {
            throw new Error(`Failed to create chat session: ${res.statusText}`);
        }

        return await res.json();
    } catch (err) {
        console.error('[createChatSession] Error:', err);
        throw err;
    }
}
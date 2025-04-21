import { API_PATHS } from "../constants/apiPaths";
import { ChatSession } from "../dto/ChatSession";
import { ChatSessionDetails } from "../dto/ChatSessionDetails";
import { apiClient } from "../lib/apiClient";

export const fetchChatSessions = async (): Promise<ChatSession[]> => {
    const res = await apiClient(API_PATHS.listChatSessions);
    return res.chatSessions;
};

export async function fetchChatSession(id: string): Promise<ChatSessionDetails> {
    return await apiClient<ChatSessionDetails>(API_PATHS.getChatSession(id));
}

export const createChatSession = async (title: string, model: string): Promise<ChatSessionDetails> => {
    return await apiClient<ChatSessionDetails>(API_PATHS.createChatSession, {
        method: 'POST',
        body: { title, model },
    });
};

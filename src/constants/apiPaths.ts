export const API_PATHS = {
    getChatSession: (id: string) => `/chat-sessions/${id}`,
    createChatSession: `/chat-sessions`,
    listChatSessions: `/chat-sessions`,
    deleteChatSession: (id: string) => `/chat-sessions/${id}`,
    chatSocketUrl: `/message`,
}
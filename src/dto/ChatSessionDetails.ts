import { ChatSession } from "./ChatSession";
import { Message } from "./Message";

export type ChatSessionDetails = ChatSession & {
    messages: Message[];
    createdAt: Date;
    updatedAt: Date;
}
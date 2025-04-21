export type Message = {
    role: 'user' | 'assistant' | 'system';
    content: string;
    stream?: '[IN_PROGRESS]' | '[DONE]';
    images?: Uint8Array[] | string[];
}
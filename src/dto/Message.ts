export type Message = {
    role: string;
    content: string;
    images?: Uint8Array[] | string[];
}
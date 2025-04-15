// src/api/chatSession.test.ts
import { fetchChatSessions } from '../../api/chatSessions';
import { fetchMock } from '../../../vitest.setup';

describe('fetchChatSessions', () => {
    beforeEach(() => {
        fetchMock.resetMocks();
    });

    it('should return chat sessions on successful fetch', async () => {
        const mockSessions = [
            { id: '1', title: 'First Chat', model: 'gpt-4' },
            { id: '2', title: 'Second Chat', model: 'llama-3' },
        ];

        fetchMock.mockResponseOnce(JSON.stringify(mockSessions));

        const sessions = await fetchChatSessions();

        expect(sessions).toEqual(mockSessions);
    });

    it('should throw an error on failed fetch', async () => {
        fetchMock.mockRejectOnce(new Error('Network error'));

        await expect(fetchChatSessions()).rejects.toThrow('Network error');
    });

    it('should throw a descriptive error on non-2xx response', async () => {
        fetchMock.mockResponseOnce('Internal Server Error', { status: 500, statusText: 'Internal Server Error' });

        await expect(fetchChatSessions()).rejects.toThrow(
            'API Error: 500 Internal Server Error - Internal Server Error'
        );
    });
});

export const ChatWindow = () => {
    return (
        <div className="flex-1 flex flex-col justify-between p-4 overflow-y-auto">
            <div className="flex-1">
                {/* Chat messages go here */}
                <p>User: Hello!</p>
                <p>AI: Hi there! How can I help?</p>
            </div>
            <div className="mt-4">
                <input
                    type="text"
                    placeholder="Type a message..."
                    className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
                />
            </div>
        </div>
    );
}
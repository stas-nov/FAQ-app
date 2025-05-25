import { useState, FormEvent, useCallback, RefObject } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => Promise<void>;
  isLoading?: boolean;
  inputRef?: RefObject<HTMLInputElement>;
}

export function ChatInput({ onSendMessage, isLoading = false, inputRef }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isLoading) return;
    
    const currentMessage = message;
    
    setMessage('');
    
    if (inputRef?.current) {
      inputRef.current.focus();
    }
    
    try {
      await onSendMessage(currentMessage);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }, [message, onSendMessage, isLoading, inputRef]);

  return (
    <form onSubmit={handleSubmit} className="w-full relative mt-4">
      <div className="relative flex items-center w-full">
        <svg
          className="absolute left-4 h-5 w-5 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="AIアシスタントに質問する..."
          className="w-full h-[65px] pl-12 pr-12 border-2 border-gray-100 rounded-[33px] bg-white rainbow-border-focus transition-all duration-300 flex items-center"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!message.trim() || isLoading}
          className={`absolute right-2 p-2 rounded-full ${!message.trim() || isLoading
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-800 hover:bg-gray-100'}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </div>
    </form>
  );
}

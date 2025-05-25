import { RefObject } from "react";
import { useLanguage } from "../context/LanguageContext";

interface ChatMessage {
  role: "user" | "ai";
  content: string;
  isError?: boolean;
}

interface ChatMessagesProps {
  messages: ChatMessage[];
  showThinking: boolean;
  chatContainerRef: RefObject<HTMLDivElement>;
  messagesEndRef: RefObject<HTMLDivElement>;
}

export function ChatMessages({
  messages,
  showThinking,
  chatContainerRef,
  messagesEndRef,
}: ChatMessagesProps) {
  const { t } = useLanguage();
  return (
    <div className="flex-1 relative overflow-hidden">
      <div
        ref={chatContainerRef}
        className="absolute top-0 left-0 right-0 bottom-0 overflow-y-scroll p-4 bg-white"
      >
        <div className="flex flex-col min-h-[100%] justify-end space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center px-4 m-auto">
              <div className="text-center">
                <div className="w-16 h-16 rainbow-bg dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-gray-800"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-1">
                  {t('chat.welcome.title')}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {t('chat.welcome.message')}
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full px-4">
              <div className="pt-2">
                {messages.map((message, index) => {
                  const isUser = message.role === "user";
                  return (
                    <div
                      key={index}
                      className={`flex mt-4 ${
                        isUser ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] lg:max-w-[70%] flex ${
                          isUser ? "flex-col items-end" : "flex-col"
                        }`}
                      >
                        <div
                          className={`rounded-2xl px-4 py-2 ${
                            isUser
                              ? "rainbow-bg text-gray-800 rounded-tr-none"
                              : message.isError
                                ? "bg-red-50 text-red-800 rounded-tl-none"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-tl-none"
                          }`}
                        >
                          <div className="break-words break-all whitespace-pre-wrap">
                            {message.content}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} className="h-0" />
              </div>
            </div>
          )}
        </div>

        {showThinking && (
          <div className="flex justify-start px-4">
            <div className="bg-gray-100 text-gray-800 rounded-2xl rounded-tl-none p-2 px-4 max-w-[85%] lg:max-w-[70%]">
              <div className="flex items-center space-x-2 h-6">
                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></div>
                <div
                  className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                ></div>
                <span className="text-gray-500 text-sm">
                  {t('chat.thinking')}
                </span>
              </div>
            </div>
          </div>
        )}


      </div>
    </div>
  );
}

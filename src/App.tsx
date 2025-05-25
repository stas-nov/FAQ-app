import { useState, useCallback, useRef, useEffect } from "react";
import { FaqDisplay, FAQItem } from "./components/FaqDisplay";
import { ChatModal } from "./components/ChatModal";
import faqData from "./data/faq.json";
import createSystemPrompt from "./data/faqPrompt";
import { chatWithGPT, Message as ApiMessage } from "./api/openai";
import "./styles/rainbow.css"; // Import the rainbow border effect
import "./styles/icon-animations.css"; // Import the icon animations

interface ChatMessage {
  role: "user" | "ai";
  content: string;
}

interface ButtonPosition {
  top: number;
  left: number;
  width: number;
  height: number;
  visibleTop: number; // Position relative to viewport
  visibleLeft: number;
}

function App() {
  const searchButtonRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [buttonPosition, setButtonPosition] = useState<ButtonPosition | null>(
    null
  );

  // Filter FAQ items based on search query
  const filteredFaqs: FAQItem[] = faqData
    .filter(
      (faq) =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .map((faq) => ({
      id: faq.id,
      category: faq.category,
      question: faq.question,
      answer: faq.answer,
    }));

  // Update button position when scrolling
  useEffect(() => {
    const updateButtonPosition = () => {
      if (searchButtonRef.current && isChatModalOpen) {
        const rect = searchButtonRef.current.getBoundingClientRect();
        setButtonPosition({
          top: rect.top + window.scrollY,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          visibleTop: rect.top,
          visibleLeft: rect.left,
        });
      }
    };

    // Only add event listeners if modal is open
    if (isChatModalOpen) {
      // Update position on scroll
      window.addEventListener("scroll", updateButtonPosition);

      // Update position on resize
      window.addEventListener("resize", updateButtonPosition);

      // Initial position update
      updateButtonPosition();

      return () => {
        window.removeEventListener("scroll", updateButtonPosition);
        window.removeEventListener("resize", updateButtonPosition);
      };
    }
  }, [isChatModalOpen]);

  // Open chat modal when search is clicked
  const handleSearchClick = () => {
    if (searchButtonRef.current) {
      const rect = searchButtonRef.current.getBoundingClientRect();
      setButtonPosition({
        top: rect.top + window.scrollY,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        visibleTop: rect.top,
        visibleLeft: rect.left,
      });
    }
    setIsChatModalOpen(true);
  };

  // Close chat modal
  const handleCloseModal = () => {
    setIsChatModalOpen(false);
  };

  // Clear chat history
  const handleClearChat = () => {
    setChatHistory([]);
  };

  // Handle sending message to AI
  const handleSendMessage = useCallback(
    async (message: string): Promise<void> => {
      setIsLoading(true);
      setError(null);

      // Add user message to chat history
      setChatHistory((prev) => [...prev, { role: "user", content: message }]);

      try {
        // Create the FAQ-specific prompt using our dedicated module
        const systemPrompt = createSystemPrompt(message);

        // Format messages for the API
        const apiMessages: ApiMessage[] = [
          { role: "system", content: systemPrompt },
          ...chatHistory.map((msg) => ({
            role:
              msg.role === "ai" ? ("assistant" as const) : ("user" as const),
            content: msg.content,
          })),
          { role: "user" as const, content: message },
        ];

        // Call the OpenAI API
        const response = await chatWithGPT(apiMessages);

        // Add AI response to chat history
        setChatHistory((prev) => [...prev, { role: "ai", content: response }]);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [chatHistory]
  );

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-3 sm:px-4">
      <div className="container mx-auto max-w-3xl">
        {/* Page Header */}
        <header className="text-center mb-6 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            よくあるご質問
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            サービスに関するよくあるご質問と回答をご覧いただけます
          </p>
        </header>

        {/* Ask AI Button */}
        <div
          ref={searchButtonRef}
          className="mb-6 sm:mb-8 search-button w-full relative flex items-stretch text-left text-base sm:text-lg border-2 border-gray-300 rounded-[33px] rainbow-border-button hover:rainbow-border-button focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent bg-white transition-colors duration-200"
          onClick={() => inputRef.current?.focus()}
        >
          <div className="grid grid-cols-12 sm:grid-cols-10 w-full">
            <div className="col-span-8 sm:col-span-7 relative">
              <input
                ref={inputRef}
                placeholder="検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3 sm:pl-7 my-3 sm:my-5 text-sm sm:text-base border-none outline-none focus:ring-0 focus:border-none hover:border-none bg-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    inputRef.current?.focus();
                  }}
                  className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
            <button
              onClick={handleSearchClick}
              className="col-span-4 sm:col-span-3 border-l-faqBorder border border-transparent rounded-r-[33px] rotate-on-hover"
            >
              <div className="flex items-center justify-center">
                <svg className="h-5 w-5 sm:h-6 sm:w-6 mr-1 sm:mr-2 ai-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12V4H12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-sm sm:text-base">AIアシスタント</span>
              </div>
            </button>
          </div>
        </div>

        {/* FAQ Section */}
        <FaqDisplay
          faqs={filteredFaqs}
          searchQuery={searchQuery}
          onSearch={setSearchQuery}
          className="space-y-4"
        />

        {/* Chat Modal */}
        <ChatModal
          isOpen={isChatModalOpen}
          onClose={handleCloseModal}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          error={error}
          messages={chatHistory}
          onClearChat={handleClearChat}
          buttonPosition={buttonPosition}
        />
      </div>
    </div>
  );
}

export default App;

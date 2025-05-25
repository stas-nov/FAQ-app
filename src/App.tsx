import { useState, useCallback, useRef, useEffect } from "react";
import { FaqDisplay, FAQItem } from "./components/FaqDisplay";
import { ChatModal } from "./components/ChatModal";
import faqData from "./data/faq.json";
import createSystemPrompt from "./data/faqPrompt";
import { chatWithGPT, Message as ApiMessage } from "./api/openai";
import "./styles/rainbow.css"; // Import the rainbow border effect

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
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-3xl">
        {/* Page Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            よくあるご質問
          </h1>
          <p className="text-gray-600">
            サービスに関するよくあるご質問と回答をご覧いただけます
          </p>
        </header>

        {/* Ask AI Button */}
        <div
          ref={searchButtonRef}
          className="mb-8 search-button w-full relative flex items-center p-5 text-left text-lg border-2 border-gray-300 rounded-[33px] rainbow-border-button hover:rainbow-border-button focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent bg-white transition-colors duration-200"
        >
          <div className="grid grid-cols-10 w-full">
            <input className="ml-7 col-span-7 bg-slate-300" />
            <button
              onClick={handleSearchClick}
              className="col-span-3 bg-red-100"
            >
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
              <span className="">AIアシスタント</span>
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

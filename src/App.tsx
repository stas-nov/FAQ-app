import { useState, useCallback, useRef, useEffect } from "react";
import { FaqDisplay, FAQItem } from "./components/FaqDisplay";
import { ChatModal } from "./components/ChatModal";
import { SearchButton } from "./components/SearchButton";
import faqData from "./data/faq.json";
import createSystemPrompt from "./data/faqPrompt";
import { chatWithGPT, Message as ApiMessage } from "./api/openai";
import "./styles/rainbow.css";
import "./styles/icon-animations.css";

interface ChatMessage {
  role: "user" | "ai";
  content: string;
}

interface ButtonPosition {
  top: number;
  left: number;
  width: number;
  height: number;
  visibleTop: number;
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

    if (isChatModalOpen) {
      window.addEventListener("scroll", updateButtonPosition);
      window.addEventListener("resize", updateButtonPosition);

      updateButtonPosition();

      return () => {
        window.removeEventListener("scroll", updateButtonPosition);
        window.removeEventListener("resize", updateButtonPosition);
      };
    }
  }, [isChatModalOpen]);

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

  const handleCloseModal = () => {
    setIsChatModalOpen(false);
  };
  const handleClearChat = () => {
    setChatHistory([]);
  };

  const handleSendMessage = useCallback(
    async (message: string): Promise<void> => {
      setIsLoading(true);
      setError(null);

      setChatHistory((prev) => [...prev, { role: "user", content: message }]);

      try {
        const systemPrompt = createSystemPrompt(message);

        const apiMessages: ApiMessage[] = [
          { role: "system", content: systemPrompt },
          ...chatHistory.map((msg) => ({
            role:
              msg.role === "ai" ? ("assistant" as const) : ("user" as const),
            content: msg.content,
          })),
          { role: "user" as const, content: message },
        ];

        const response = await chatWithGPT(apiMessages);

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
        <header className="text-center mb-6 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            よくあるご質問
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            サービスに関するよくあるご質問と回答をご覧いただけます
          </p>
        </header>

        <SearchButton
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          inputRef={inputRef}
          searchButtonRef={searchButtonRef}
          handleSearchClick={handleSearchClick}
        />

        <FaqDisplay
          faqs={filteredFaqs}
        />

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

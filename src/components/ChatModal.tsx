import { useRef, useEffect, useState, CSSProperties } from "react";
import { ChatInput } from "./ChatInput";
import { ChatMessages } from "./ChatMessages";
import { useLanguage } from "../context/LanguageContext";
import { useMediaQuery } from "../hooks/useMediaQuery";

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

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (message: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  messages?: ChatMessage[];
  onClearChat?: () => void;
  buttonPosition: ButtonPosition | null;
}

export function ChatModal({
  isOpen,
  onClose,
  onSendMessage,
  isLoading,
  error,
  messages = [],
  onClearChat,
  buttonPosition,
}: ChatModalProps) {
  const { t } = useLanguage();
  const isMobile = useMediaQuery('(max-width: 640px)');
  const [animationStage, setAnimationStage] = useState<
    "initial" | "expanding" | "expanded"
  >("initial");
  const [showThinking, setShowThinking] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const thinkingTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages, showThinking]);

  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    if (isOpen) {
      const currentScrollPos = window.pageYOffset || document.documentElement.scrollTop;
      setScrollPosition(currentScrollPos);
      
      if (isMobile) {
        setAnimationStage("expanded");
        if (inputRef.current) {
          inputRef.current.focus();
        }
        document.body.style.position = 'fixed';
        document.body.style.top = `-${currentScrollPos}px`;
        document.body.style.width = '100%';
      } else {
        setAnimationStage("initial");

        const expandingTimer = setTimeout(() => {
          setAnimationStage("expanding");
        }, 50);
        const expandedTimer = setTimeout(() => {
          setAnimationStage("expanded");
          if (inputRef.current) {
            inputRef.current.focus();
          }

          const scrollbarWidth =
            window.innerWidth - document.documentElement.clientWidth;
          document.body.style.paddingRight = `${scrollbarWidth}px`;

          document.body.style.overflow = "hidden";
        }, 300);

        return () => {
          clearTimeout(expandingTimer);
          clearTimeout(expandedTimer);
        };
      }
    } else {
      setAnimationStage("initial");
      
      if (isMobile) {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollPosition);
      }
      
      document.body.style.overflow = "auto";
      document.body.style.paddingRight = "0";
    }
  }, [isOpen, isMobile]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    function handleEscKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    if (isOpen && animationStage === "expanded") {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen, onClose, animationStage]);

  useEffect(() => {
    if (chatContainerRef.current && isOpen) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages, isOpen, animationStage]);

  useEffect(() => {
    if (isLoading) {
      if (thinkingTimerRef.current) {
        clearTimeout(thinkingTimerRef.current);
      }

      thinkingTimerRef.current = setTimeout(() => {
        setShowThinking(true);
      }, 500);
    } else {
      if (thinkingTimerRef.current) {
        clearTimeout(thinkingTimerRef.current);
        thinkingTimerRef.current = null;
      }
      setShowThinking(false);
    }

    return () => {
      if (thinkingTimerRef.current) {
        clearTimeout(thinkingTimerRef.current);
      }
    };
  }, [isLoading]);

  if (!isOpen) {
    document.body.style.overflow = "auto";
    return null;
  }

  const calculateVisibility = (): CSSProperties => {
    if (!buttonPosition) return {};

    const viewportHeight = window.innerHeight;
    const buttonVisibleTop = Math.max(0, buttonPosition.visibleTop);
    const buttonVisibleBottom = Math.min(
      viewportHeight,
      buttonPosition.visibleTop + buttonPosition.height
    );
    const buttonVisibleHeight = buttonVisibleBottom - buttonVisibleTop;
    const buttonVisibilityRatio = buttonVisibleHeight / buttonPosition.height;

    if (buttonVisibilityRatio <= 0) {
      return { display: "none" };
    }

    if (animationStage === "initial") {
      let clipPath = "";
      if (buttonPosition.visibleTop < 0) {
        const hiddenRatio =
          Math.abs(buttonPosition.visibleTop) / buttonPosition.height;
        clipPath = `inset(${hiddenRatio * 100}% 0 0 0)`;
      }

      if (buttonPosition.visibleTop + buttonPosition.height > viewportHeight) {
        const visibleHeight = viewportHeight - buttonPosition.visibleTop;
        const hiddenRatio =
          (buttonPosition.height - visibleHeight) / buttonPosition.height;
        clipPath = `inset(0 0 ${hiddenRatio * 100}% 0)`;
      }

      return clipPath ? { clipPath } : {};
    }

    return {};
  };

  const getModalStyles = (): CSSProperties => {
    // For mobile devices, use full screen modal without animations or position adjustments
    if (isMobile) {
      return {
        position: "fixed" as const,
        top: 0,
        left: 0,
        width: "100%",
        height: "100vh",
        borderRadius: 0,
        opacity: 1,
        zIndex: 1000,
        boxShadow: "none",
        overflow: "hidden",
      };
    }
    
    // Desktop behavior with animations and positioning
    const visibilityStyles = calculateVisibility();

    if (animationStage === "initial") {
      return {
        position: "fixed" as const,
        top: buttonPosition ? `${buttonPosition.visibleTop}px` : "10%",
        left: buttonPosition ? `${buttonPosition.visibleLeft}px` : "50%",
        width: buttonPosition ? `${buttonPosition.width}px` : "100%",
        height: buttonPosition ? `${buttonPosition.height}px` : "0",
        borderRadius: "33px",
        opacity: 0,
        zIndex: 1000,
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
        overflow: "hidden",
        ...visibilityStyles,
      };
    } else if (animationStage === "expanding") {
      return {
        position: "fixed" as const,
        top: buttonPosition ? `${buttonPosition.visibleTop}px` : "10%",
        left: buttonPosition ? `${buttonPosition.visibleLeft}px` : "50%",
        width: buttonPosition ? `${buttonPosition.width}px` : "100%",
        height: "70vh",
        borderRadius: "33px",
        opacity: 1,
        transition: "height 0.3s ease-out",
        zIndex: 1000,
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
        overflow: "hidden",
        ...visibilityStyles,
      };
    } else {
      return {
        position: "fixed" as const,
        top: buttonPosition ? `${buttonPosition.visibleTop}px` : "10%",
        left: buttonPosition ? `${buttonPosition.visibleLeft}px` : "50%",
        width: buttonPosition ? `${buttonPosition.width}px` : "100%",
        height: "70vh",
        borderRadius: "33px",
        opacity: 1,
        zIndex: 1000,
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
        overflow: "hidden",
        ...visibilityStyles,
      };
    }
  };

  const getBgOpacity = () => {
    if (isMobile) return 0.5;
    if (animationStage === "initial") return 0;
    if (animationStage === "expanding") return 0.3;
    return 0.5;
  };

  return (
    <div
      className="fixed inset-0 z-50 transition-colors duration-300"
      style={{
        backgroundColor: `rgba(0, 0, 0, ${getBgOpacity()})`,
        pointerEvents: animationStage === "initial" ? "none" : "auto",
      }}
    >
      <div
        ref={modalRef}
        className="bg-white shadow-2xl flex flex-col overflow-hidden pointer-events-auto"
        style={{
          ...getModalStyles(),
          height: isMobile ? "100vh" : "70vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div className="flex justify-between items-center p-4 border-b rounded-b-[33px]">
          <h2 className="text-xl font-semibold text-gray-800">
            {t('chat.title')}
          </h2>
          <div className="flex gap-2">
            {onClearChat && messages.length > 0 && (
              <button
                onClick={onClearChat}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                title={t('chat.buttons.clear')}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
              title={t('chat.buttons.close')}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex flex-col flex-1 overflow-hidden">
          <ChatMessages
            messages={messages}
            showThinking={showThinking}
            chatContainerRef={chatContainerRef}
            messagesEndRef={messagesEndRef}
          />

          <ChatInput
            onSendMessage={async (message) => {
              await onSendMessage(message);
              setTimeout(() => {
                if (inputRef.current) {
                  inputRef.current.focus();
                }
              }, 0);
            }}
            isLoading={isLoading}
            inputRef={inputRef}
          />
        </div>
      </div>
    </div>
  );
}

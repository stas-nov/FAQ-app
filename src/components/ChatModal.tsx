import React, { useRef, useEffect, useState, CSSProperties } from 'react';
import { ChatInput } from './ChatInput';

interface ChatMessage {
  role: 'user' | 'ai';
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
  buttonPosition
}: ChatModalProps) {
  // State to track animation stages
  const [animationStage, setAnimationStage] = useState<'initial' | 'expanding' | 'expanded'>('initial');
  // State to track whether to show the thinking indicator
  const [showThinking, setShowThinking] = useState(false);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const thinkingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll to bottom when messages or thinking state changes
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, showThinking]);

  // Handle modal opening animation stages
  useEffect(() => {
    if (isOpen) {
      // Start with initial state
      setAnimationStage('initial');
      
      // Move to expanding state after a tiny delay
      const expandingTimer = setTimeout(() => {
        setAnimationStage('expanding');
      }, 50);
      
      // Move to fully expanded state
      const expandedTimer = setTimeout(() => {
        setAnimationStage('expanded');
        // Auto-focus the input when fully expanded
        if (inputRef.current) {
          inputRef.current.focus();
        }
        
        // Prevent layout shift by calculating scrollbar width and adding padding
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.paddingRight = `${scrollbarWidth}px`;
        
        // Disable scrolling when modal is fully expanded
        document.body.style.overflow = 'hidden';
      }, 300);
      
      return () => {
        clearTimeout(expandingTimer);
        clearTimeout(expandedTimer);
      };
    } else {
      setAnimationStage('initial');
      document.body.style.overflow = 'auto';
      document.body.style.paddingRight = '0';
    }
  }, [isOpen]);
  
  // Handle click outside to close modal
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    // Handle escape key to close modal
    function handleEscKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    if (isOpen && animationStage === 'expanded') {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose, animationStage]);

  // Scroll to bottom when modal is opened or new messages are added
  useEffect(() => {
    if (chatContainerRef.current && isOpen) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isOpen, animationStage]);
  
  // Handle the delayed showing of the thinking indicator
  useEffect(() => {
    if (isLoading) {
      // Clear any existing timer
      if (thinkingTimerRef.current) {
        clearTimeout(thinkingTimerRef.current);
      }
      
      // Set a new timer to show the thinking indicator after 500ms
      thinkingTimerRef.current = setTimeout(() => {
        setShowThinking(true);
      }, 500);
    } else {
      // Clear the timer and hide the thinking indicator when loading is done
      if (thinkingTimerRef.current) {
        clearTimeout(thinkingTimerRef.current);
        thinkingTimerRef.current = null;
      }
      setShowThinking(false);
    }
    
    // Cleanup function to clear the timer when component unmounts or isLoading changes
    return () => {
      if (thinkingTimerRef.current) {
        clearTimeout(thinkingTimerRef.current);
      }
    };
  }, [isLoading]);

  // Don't render anything if modal is closed
  if (!isOpen) {
    // Ensure scrolling is enabled when modal is closed
    document.body.style.overflow = 'auto';
    return null;
  }
  
  // Calculate how much of the modal should be visible based on button visibility
  const calculateVisibility = (): CSSProperties => {
    if (!buttonPosition) return {};
    
    // Calculate the visible portion of the button
    const viewportHeight = window.innerHeight;
    const buttonVisibleTop = Math.max(0, buttonPosition.visibleTop);
    const buttonVisibleBottom = Math.min(viewportHeight, buttonPosition.visibleTop + buttonPosition.height);
    const buttonVisibleHeight = buttonVisibleBottom - buttonVisibleTop;
    const buttonVisibilityRatio = buttonVisibleHeight / buttonPosition.height;
    
    // If button is completely hidden, hide the modal too
    if (buttonVisibilityRatio <= 0) {
      return { display: 'none' };
    }
    
      // We want the modal to always follow the button's position exactly,
    // whether it's partially visible or fully visible
    if (animationStage === 'initial') {
      // For initial state, use clip-path to match button exactly
      let clipPath = '';
      
      // If button is partially hidden at the top
      if (buttonPosition.visibleTop < 0) {
        const hiddenRatio = Math.abs(buttonPosition.visibleTop) / buttonPosition.height;
        clipPath = `inset(${hiddenRatio * 100}% 0 0 0)`;
      }
      
      // If button is partially hidden at the bottom
      if (buttonPosition.visibleTop + buttonPosition.height > viewportHeight) {
        const visibleHeight = viewportHeight - buttonPosition.visibleTop;
        const hiddenRatio = (buttonPosition.height - visibleHeight) / buttonPosition.height;
        clipPath = `inset(0 0 ${hiddenRatio * 100}% 0)`;
      }
      
      return clipPath ? { clipPath } : {};
    }
    
    return {};
  };
  
  // Different styles based on animation stage
  const getModalStyles = (): CSSProperties => {
    const visibilityStyles = calculateVisibility();
    
    if (animationStage === 'initial' && buttonPosition) {
      // Initial state - exactly match the button
      return {
        position: 'fixed' as const,
        top: `${buttonPosition.visibleTop}px`,
        left: `${buttonPosition.visibleLeft}px`,
        width: `${buttonPosition.width}px`,
        height: `${buttonPosition.height}px`,
        borderRadius: '33px', // Large rounded corners that match the button style
        opacity: 1,
        maxHeight: `${buttonPosition.height}px`,
        overflow: 'hidden',
        transition: 'none',
        zIndex: 1000,
        ...visibilityStyles
      };
    } else if (animationStage === 'expanding') {
      // Expanding state - animate height but keep width and position
      return {
        position: 'fixed' as const,
        top: buttonPosition ? `${buttonPosition.visibleTop}px` : '10%',
        left: buttonPosition ? `${buttonPosition.visibleLeft}px` : '50%',
        width: buttonPosition ? `${buttonPosition.width}px` : '100%',
        height: '70vh',
        borderRadius: '33px', // Large rounded corners that match the button style
        opacity: 1,
        transition: 'height 0.3s ease-out',
        zIndex: 1000,
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
        overflow: 'hidden',
        ...visibilityStyles
      };
    } else {
      // Final state - maintain the same width and horizontal position as the button
      return {
        position: 'fixed' as const,
        top: buttonPosition ? `${buttonPosition.visibleTop}px` : '10%',
        left: buttonPosition ? `${buttonPosition.visibleLeft}px` : '50%',
        width: buttonPosition ? `${buttonPosition.width}px` : '100%',
        height: '70vh',
        borderRadius: '33px', // Large rounded corners that match the button style
        opacity: 1,
        zIndex: 1000,
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
        overflow: 'hidden', // Changed from 'auto' to 'hidden' to prevent double scrollbars
        ...visibilityStyles
      };
    }
  };

  // Background opacity based on animation stage
  const getBgOpacity = () => {
    if (animationStage === 'initial') return 0;
    if (animationStage === 'expanding') return 0.3;
    return 0.5;
  };

  return (
    <div 
      className="fixed inset-0 z-50 transition-colors duration-300"
      style={{
        backgroundColor: `rgba(0, 0, 0, ${getBgOpacity()})`,
        pointerEvents: animationStage === 'initial' ? 'none' : 'auto'
      }}
    >
      <div 
        ref={modalRef}
        className="bg-white shadow-2xl flex flex-col overflow-hidden pointer-events-auto"
        style={{ ...getModalStyles(), height: '70vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b rounded-b-[33px]">
          <h2 className="text-xl font-semibold text-gray-800">AIアシスタントとチャット</h2>
          <div className="flex gap-2">
            {onClearChat && messages.length > 0 && (
              <button 
                onClick={onClearChat}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                title="チャットをクリア"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
            <button 
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
              title="閉じる"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Main content area with flex layout */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          {/* Chat Messages Container - Scrollable area */}
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            {/* Scrollable Messages Area */}
            <div 
              ref={chatContainerRef}
              style={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                overflowY: 'scroll',
                padding: '16px',
                backgroundColor: '#fff'
              }}
            >
              {/* Messages container with bottom-to-top scrolling */}
              <div style={{ display: 'flex', flexDirection: 'column-reverse' }}>
                {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center px-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-1">チャットを開始</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">私たちのサービスについて、どんな質問でもお答えします！</p>
                  </div>
                </div>
              ) : (
                <div className="w-full px-4 py-2">
                  <div className="pt-2">
                    {messages.map((message, index) => {
                      const isUser = message.role === 'user';
                      return (
                        <div 
                          key={index}
                          className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2`}
                        >
                          <div className={`max-w-[85%] lg:max-w-[70%] flex ${isUser ? 'flex-col items-end' : 'flex-col'}`}>
                            <div 
                              className={`rounded-2xl px-4 py-2 text-sm ${isUser 
                                ? 'bg-blue-500 text-white rounded-tr-none' 
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-tl-none'}`}
                            >
                              <div className="break-words break-all whitespace-pre-wrap">{message.content}</div>
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
              
              {/* Loading indicator and error messages */}
              <div className="mt-2">
                {showThinking && (
                  <div className="flex justify-start px-4">
                    <div className="bg-gray-100 text-gray-800 rounded-2xl rounded-tl-none p-2 px-4 max-w-[85%] lg:max-w-[70%]">
                      <div className="flex items-center space-x-2 h-6">
                        <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        <span className="text-gray-500 text-sm">考えています...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {error && (
                  <div className="flex justify-start px-4">
                    <div className="bg-red-50 text-red-800 rounded-2xl rounded-tl-none p-2 px-4 max-w-[85%] lg:max-w-[70%]">
                      <p className="text-sm">{error}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Chat Input */}
          <div style={{ marginTop: 'auto' }}>
            <ChatInput 
              onSendMessage={async (message) => {
                await onSendMessage(message);
                // Ensure input is focused after message is sent
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
    </div>
  );
}

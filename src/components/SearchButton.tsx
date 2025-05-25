import { RefObject } from "react";
import { useLanguage } from "../context/LanguageContext";
import { useMediaQuery } from "../hooks/useMediaQuery";

interface SearchButtonProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  inputRef: RefObject<HTMLInputElement>;
  searchButtonRef: RefObject<HTMLDivElement>;
  handleSearchClick: () => void;
}

export function SearchButton({
  searchQuery,
  setSearchQuery,
  inputRef,
  searchButtonRef,
  handleSearchClick,
}: SearchButtonProps) {
  const { t } = useLanguage();
  const isMobile = useMediaQuery('(max-width: 640px)');
  return (
    <div
      ref={searchButtonRef}
      className="max-w-3xl mx-auto mb-6 sm:mb-8 search-button w-full relative flex flex-col sm:flex-row items-stretch text-left text-base sm:text-lg border-2 border-gray-300 rounded-[33px] rainbow-border-button hover:rainbow-border-button focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent bg-white transition-colors duration-200"
    >
      <div className="flex flex-col sm:grid sm:grid-cols-10 w-full">
        <div className="sm:col-span-7 flex-1 relative">
          <input
            ref={inputRef}
            placeholder={t("search.placeholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-4 sm:pl-7 sm:py-5 text-base border-none outline-none focus:ring-0 focus:border-none bg-transparent"
            style={{ fontSize: "16px" }}
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                inputRef.current?.focus();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                /* larger touch area for mobile */ viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>
        <button
          onClick={handleSearchClick}
          className="sm:col-span-3 w-full sm:w-auto sm:border-l-faqBorder border-t-faqBorder border border-transparent sm:rounded-r-[33px] sm:rounded-b-none rotate-on-hover py-3 sm:py-0"
        >
          <div className="flex items-center justify-center">
            <svg
              className="h-6 w-6 mr-2 ai-icon"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12V4H12Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-base">{t("search.aiButton")}</span>
          </div>
        </button>
      </div>
    </div>
  );
}

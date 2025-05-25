import { RefObject } from "react";

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
  return (
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
  );
}

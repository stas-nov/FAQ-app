import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import LanguageIcon from './icons/LanguageIcon';

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get language display information
  const languages = [
    { code: 'ja', flag: '🇯🇵', label: 'Japanese' },
    { code: 'en', flag: '🇺🇸', label: 'English' }
  ];

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 px-3 py-2 rounded bg-white border border-gray-200 hover:bg-gray-50 focus:outline-none text-sm"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <LanguageIcon className="w-5 h-5 text-gray-600 mr-1" />
        <span>{currentLanguage.flag}</span>
        <svg className="h-4 w-4 text-gray-500 ml-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1" role="menu" aria-orientation="vertical">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code as 'ja' | 'en');
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm ${language === lang.code ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} hover:bg-gray-100 flex items-center space-x-2`}
                role="menuitem"
              >
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';

export interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

interface FaqDisplayProps {
  faqs: FAQItem[];
  onSearch?: (query: string) => void;
  searchQuery?: string;
  className?: string;
}

export function FaqDisplay({ 
  faqs, 
  onSearch, 
  searchQuery = '',
  className = '' 
}: FaqDisplayProps) {
  const [openFaqIds, setOpenFaqIds] = useState<string[]>([]);

  // Toggle FAQ open/close
  const toggleFaq = (id: string) => {
    if (openFaqIds.includes(id)) {
      // Close this FAQ
      setOpenFaqIds(openFaqIds.filter(faqId => faqId !== id));
    } else {
      // Open this FAQ
      setOpenFaqIds([...openFaqIds, id]);
    }
  };

  // Group FAQs by category
  const groupedFaqs: Record<string, FAQItem[]> = {};
  faqs.forEach((faq) => {
    if (!groupedFaqs[faq.category]) {
      groupedFaqs[faq.category] = [];
    }
    groupedFaqs[faq.category].push(faq);
  });

  // Sort categories alphabetically
  const sortedCategories = Object.keys(groupedFaqs).sort();

  return (
    <div className={`faq-container ${className}`}>
      {faqs.length > 0 ? (
        sortedCategories.map((category) => (
          <div key={category} className="">
            {/* Simple Category Header */}
            <p className="text-3xl mb-4 font-semibold text-gray-800">
              {category}
            </p>

            {/* FAQs in this category */}
            <div className="">
              {groupedFaqs[category].map((faq) => (
                <div 
                  key={faq.id} 
                  className={`faq-item ${openFaqIds.includes(faq.id) ? 'open' : ''}`}
                >
                  <div 
                    className="faq-question cursor-pointer p-4 bg-white shadow-sm hover:shadow transition-shadow flex justify-between items-center"
                    onClick={() => toggleFaq(faq.id)}
                  >
                    <h3 className="font-medium text-lg text-gray-800">{faq.question}</h3>
                    <span className="text-gray-500">
                      {openFaqIds.includes(faq.id) ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      )}
                    </span>
                  </div>
                  <div className={`faq-answer p-4 bg-gray-50 rounded-b-lg ${openFaqIds.includes(faq.id) ? 'block' : 'hidden'}`}>
                    <p className="text-gray-700">{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500 py-4">No FAQs found matching your search.</p>
      )}
    </div>
  );
}

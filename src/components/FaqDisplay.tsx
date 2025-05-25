import { useState } from 'react';

export interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

interface FaqDisplayProps {
  faqs: FAQItem[];
}

export function FaqDisplay({ 
  faqs
}: FaqDisplayProps) {
  const [openFaqIds, setOpenFaqIds] = useState<string[]>([]);

  const toggleFaq = (id: string) => {
    if (openFaqIds.includes(id)) {
      setOpenFaqIds(openFaqIds.filter(faqId => faqId !== id));
    } else {
      setOpenFaqIds([...openFaqIds, id]);
    }
  };

  const groupedFaqs: Record<string, FAQItem[]> = {};
  faqs.forEach((faq) => {
    if (!groupedFaqs[faq.category]) {
      groupedFaqs[faq.category] = [];
    }
    groupedFaqs[faq.category].push(faq);
  });

  const sortedCategories = Object.keys(groupedFaqs).sort();

  return (
    <div className="faq-container space-y-4">
      {faqs.length > 0 ? (
        sortedCategories.map((category) => (
          <div key={category}>
            <p className="text-2xl sm:text-3xl mb-3 sm:mb-4 font-semibold text-gray-800">
              {category}
            </p>

            <div>
              {groupedFaqs[category].map((faq) => (
                <div 
                  key={faq.id} 
                  className={`faq-item ${openFaqIds.includes(faq.id) ? 'open' : ''}`}
                >
                  <div 
                    className="faq-question cursor-pointer p-3 sm:p-4 bg-white shadow-sm hover:shadow transition-shadow flex justify-between items-center"
                    onClick={() => toggleFaq(faq.id)}
                  >
                    <h3 className="font-medium text-base sm:text-lg text-gray-800">{faq.question}</h3>
                    <span className="text-gray-500">
                      {openFaqIds.includes(faq.id) ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      )}
                    </span>
                  </div>
                  <div className={`faq-answer p-3 sm:p-4 bg-gray-50 ${openFaqIds.includes(faq.id) ? 'block' : 'hidden'}`}>
                    <p className="text-sm sm:text-base text-gray-700">{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <p className="text-center text-sm sm:text-base text-gray-500 py-3 sm:py-4">お探しのFAQが見つかりませんでした。</p>
      )}
    </div>
  );
}

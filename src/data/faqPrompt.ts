import faqData from './faq.json';

export function createFaqPrompt(): string {
  const faqsByCategory: Record<string, Array<{ question: string; answer: string }>> = {};
  
  faqData.forEach(faq => {
    if (!faqsByCategory[faq.category]) {
      faqsByCategory[faq.category] = [];
    }
    
    faqsByCategory[faq.category].push({
      question: faq.question,
      answer: faq.answer
    });
  });
  
  let formattedPrompt = '';
  
  Object.entries(faqsByCategory).forEach(([category, faqs]) => {
    formattedPrompt += `## ${category}\n\n`;
    
    faqs.forEach(faq => {
      formattedPrompt += `Q: ${faq.question}\nA: ${faq.answer}\n\n`;
    });
  });
  
  return formattedPrompt.trim();
}

export function createSystemPrompt(userQuestion: string): string {
  const faqContent = createFaqPrompt();
  
    return `あなたはFAQ専用のAIです。下記FAQに基づいて質問に答えてください。FAQリストにそのような情報がなければ「申し訳ありませんが、その質問にはお答えできません。」と返答してください。

[FAQリスト]
${faqContent}

ユーザーの質問: ${userQuestion}`;
}

export default createSystemPrompt;

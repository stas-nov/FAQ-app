import faqData from './faq.json';

/**
 * Creates a formatted FAQ prompt string that's optimized for LLM understanding
 * @returns A string containing all FAQs in a structured format
 */
export function createFaqPrompt(): string {
  // Group FAQs by category
  const faqsByCategory: Record<string, Array<{ question: string; answer: string }>> = {};
  
  // Process and group all FAQ items
  faqData.forEach(faq => {
    if (!faqsByCategory[faq.category]) {
      faqsByCategory[faq.category] = [];
    }
    
    faqsByCategory[faq.category].push({
      question: faq.question,
      answer: faq.answer
    });
  });
  
  // Build the formatted prompt
  let formattedPrompt = '';
  
  // Add each category and its FAQs
  Object.entries(faqsByCategory).forEach(([category, faqs]) => {
    formattedPrompt += `## ${category}\n\n`;
    
    // Add each Q&A pair in this category
    faqs.forEach(faq => {
      formattedPrompt += `Q: ${faq.question}\nA: ${faq.answer}\n\n`;
    });
  });
  
  return formattedPrompt.trim();
}

/**
 * Creates the complete system prompt with instructions and FAQ data
 * @param userQuestion The user's current question
 * @returns A complete system prompt string
 */
export function createSystemPrompt(userQuestion: string): string {
  const faqContent = createFaqPrompt();
  
  return `あなたはFAQ専用のAIです。下記FAQに基づいて質問に答えてください。FAQリストにそのような情報がなければ「申し訳ありませんが、その質問にはお答えできません。」と返答してください。

[FAQリスト]
${faqContent}

ユーザーの質問: ${userQuestion}`;
}

export default createSystemPrompt;

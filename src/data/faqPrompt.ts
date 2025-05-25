import faqData from "./faq.json";
import faqDataEng from "./faq-en.json";

export function createFaqPrompt(language: string = "ja"): string {
  const faq = language === "en" ? faqDataEng : faqData;

  const faqsByCategory: Record<
    string,
    Array<{ question: string; answer: string }>
  > = {};

  faq.forEach((faq) => {
    if (!faqsByCategory[faq.category]) {
      faqsByCategory[faq.category] = [];
    }

    faqsByCategory[faq.category].push({
      question: faq.question,
      answer: faq.answer,
    });
  });

  let formattedPrompt = "";

  Object.entries(faqsByCategory).forEach(([category, faqs]) => {
    formattedPrompt += `## ${category}\n\n`;

    faqs.forEach((faq) => {
      formattedPrompt += `Q: ${faq.question}\nA: ${faq.answer}\n\n`;
    });
  });

  return formattedPrompt.trim();
}

export function createSystemPrompt(userQuestion: string, language: string = "ja"): string {
  const faqContent = createFaqPrompt(language);

  return `
    <role>
      You are an AI assistant that answers questions based solely on the FAQ list below. Please search for the most relevant information, and answer the user's question clearly, using summaries or paraphrasing if needed.
    </role>

    <instructions>
      1. Even if there is no exact match in the FAQ, use any related information from the list to answer the question as best you can.
      2. If there is no relevant information in the FAQ, reply: "Sorry, I cannot answer that question." OR "申し訳ありませんが、その質問にはお答えできません。" depending on the user's language.
      3. Always answer in the same language that the user used to ask the question (Japanese or English).
      4. Do not use bold, italics, bullet points, symbols, decorative formatting, block quotes, or code blocks. Only output plain, normal sentences—no formatting or special styles.
    </instructions>

    <faq_list>
      ${faqContent}
    </faq_list>

    <user_question>
      ${userQuestion}
    </user_question>
  `;
}

export default createSystemPrompt;

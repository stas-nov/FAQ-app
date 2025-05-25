const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
const API_URL = 'https://api.openai.com/v1/chat/completions';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function chatWithGPT(messages: Message[]): Promise<string> {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI APIキーが設定されていません。.envファイルをご確認ください。（WebサイトではAI機能を使えません。）');
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'OpenAI APIからデータを取得できませんでした。');
    }

    const data = await response.json();
    return data.choices[0]?.message?.content?.trim() || 'AIアシスタントから返答がありませんでした。';
  } catch (error) {
    console.error('OpenAI API呼び出し中にエラーが発生しました:', error);
    throw error;
  }
}

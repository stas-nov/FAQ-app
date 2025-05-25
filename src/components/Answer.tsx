interface AnswerProps {
  content: string;
  isLoading?: boolean;
  error?: string | null;
}

export function Answer({ content, isLoading, error }: AnswerProps) {
  if (error) {
    return (
      <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
        <p className="font-medium">Error:</p>
        <p>{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    );
  }

  if (!content) return null;

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="prose max-w-none">
        {content.split('\n').map((paragraph, i) => (
          <p key={i} className="">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
}

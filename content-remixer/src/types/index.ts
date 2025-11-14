// Content remixer types
export interface RemixRequest {
  originalText: string;
  remixType: 'short-form' | 'social-media' | 'bullet-points' | 'summary';
}

export interface RemixResponse {
  id: string;
  originalText: string;
  remixedContent: string[];
  timestamp: Date;
  remixType: string;
}

export interface ApiError {
  message: string;
  status: number;
}

// OpenAI API types
export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAIRequest {
  model: string;
  messages: OpenAIMessage[];
  max_tokens?: number;
  temperature?: number;
}

export interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage: {
    total_tokens: number;
  };
}


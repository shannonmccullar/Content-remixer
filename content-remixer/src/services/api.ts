import axios from 'axios';
import { OpenAIRequest, OpenAIResponse, RemixRequest, RemixResponse, ApiError } from '../types';

const API_BASE_URL = import.meta.env.VITE_OPENAI_API_URL || 'https://api.openai.com/v1';
const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`,
  },
});

export const remixContent = async (request: RemixRequest): Promise<RemixResponse> => {
  try {
    const systemPrompt = `You are a content remixer. Take the given text and create multiple short-form versions:
    1. A concise summary (2-3 sentences)
    2. A social media post (1-2 sentences, engaging)
    3. Key bullet points (3-5 points)
    
    Return the results as a JSON array of strings.`;

    const userPrompt = `Please remix this content: ${request.originalText}`;

    const openAIRequest: OpenAIRequest = {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 500,
      temperature: 0.7,
    };

    const response = await apiClient.post<OpenAIResponse>('/chat/completions', openAIRequest);
    
    const content = response.data.choices[0]?.message?.content || '';
    
    // Try to parse JSON response, fallback to simple text
    let remixedContent: string[];
    try {
      remixedContent = JSON.parse(content);
    } catch {
      remixedContent = [content];
    }

    return {
      id: Date.now().toString(),
      originalText: request.originalText,
      remixedContent,
      timestamp: new Date(),
      remixType: request.remixType,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw {
        message: error.response?.data?.error?.message || 'API request failed',
        status: error.response?.status || 500,
      } as ApiError;
    }
    throw {
      message: 'An unexpected error occurred',
      status: 500,
    } as ApiError;
  }
};

export const checkApiKey = (): boolean => {
  return !!API_KEY;
};


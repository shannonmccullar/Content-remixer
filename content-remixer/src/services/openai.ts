export interface RemixRequest {
  content: string
  remixTypes: string[]
}

export interface RemixResponse {
  type: string
  content: string
  metadata?: Record<string, any>
}

export const remixContent = async (request: RemixRequest): Promise<RemixResponse[]> => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  const apiUrl = import.meta.env.VITE_OPENAI_API_URL || 'https://api.openai.com/v1'

  if (!apiKey) {
    throw new Error('OpenAI API key not found')
  }
  
  console.log('API Key found:', apiKey.substring(0, 10) + '...')
  console.log('API URL:', apiUrl)

  const remixPromises = request.remixTypes.map(async (type) => {
    const prompt = generateLinkedInPrompt(request.content, type)
    
    try {
      const response = await fetch(`${apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a LinkedIn content expert. Create engaging, professional LinkedIn posts that drive engagement and provide value to the audience. Focus on storytelling, insights, and actionable takeaways.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 800,
          temperature: 0.8
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('OpenAI API response:', response.status, errorText)
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      const remixedContent = data.choices[0]?.message?.content?.trim()

      if (!remixedContent) {
        throw new Error('No content received from OpenAI')
      }

      return {
        type,
        content: remixedContent,
        metadata: {
          model: data.model,
          usage: data.usage,
          originalLength: request.content.length
        }
      }
    } catch (error) {
      console.error(`Error remixing content for type ${type}:`, error)
      return {
        type,
        content: `Error generating ${type}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        metadata: { error: true }
      }
    }
  })

  return Promise.all(remixPromises)
}

const generateLinkedInPrompt = (content: string, postType: string): string => {
  const basePrompt = `Create a LinkedIn post based on this content: "${content}"

Requirements:
- Professional tone
- Engaging opening hook
- Clear value proposition
- Include relevant hashtags (3-5)
- End with a call-to-action or question
- Keep under 1,300 characters (LinkedIn limit)
- Use line breaks for readability

Post type: ${postType}`

  switch (postType) {
    case 'storytelling':
      return `${basePrompt}

Style: Tell a compelling story that relates to the content. Use "I" statements and personal experience. Make it relatable and authentic.`
    
    case 'insights':
      return `${basePrompt}

Style: Share key insights and lessons learned. Focus on "what I discovered" or "here's what I learned." Be educational and thought-provoking.`
    
    case 'tips':
      return `${basePrompt}

Style: Provide actionable tips and advice. Use numbered lists or bullet points. Make it practical and immediately useful.`
    
    case 'question':
      return `${basePrompt}

Style: Pose thought-provoking questions that encourage discussion. Start with a question and build context around it.`
    
    case 'achievement':
      return `${basePrompt}

Style: Celebrate a win or milestone related to the content. Be humble but confident. Share the journey, not just the result.`
    
    case 'industry_trend':
      return `${basePrompt}

Style: Discuss industry trends or observations. Be forward-thinking and show expertise. Connect to broader business implications.`
    
    default:
      return basePrompt
  }
}

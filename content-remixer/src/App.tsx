import { useState } from 'react'

function App() {
  const [inputText, setInputText] = useState('')
  const [remixedContent, setRemixedContent] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleRemix = async () => {
    if (!inputText.trim()) return
    
    setIsLoading(true)
    // TODO: Implement OpenAI API call here
    // For now, just simulate a response
    setTimeout(() => {
      setRemixedContent([
        "Short form version 1: " + inputText.substring(0, 100) + "...",
        "Social media post: " + inputText.substring(0, 50) + "...",
        "Bullet points: " + inputText.substring(0, 80) + "..."
      ])
      setIsLoading(false)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          Content Remixer
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <label htmlFor="input-text" className="block text-sm font-medium text-gray-700 mb-2">
            Paste your long-form content here:
          </label>
          <textarea
            id="input-text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter your long-form text content here..."
            className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          
          <button
            onClick={handleRemix}
            disabled={isLoading || !inputText.trim()}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Remixing...' : 'Remix Content'}
          </button>
        </div>

        {remixedContent.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Remixed Content</h2>
            <div className="space-y-4">
              {remixedContent.map((content, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-md">
                  <p className="text-gray-700">{content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App

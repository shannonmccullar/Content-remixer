import { useState, useEffect } from 'react'
import { remixContent } from './services/openai'
import { saveOriginalContent, saveRemixOutput, getAllRemixOutputs } from './services/database'

interface LinkedInPost {
  type: string
  content: string
  metadata?: Record<string, any>
  saved?: boolean
  deleted?: boolean
}

interface SavedPost {
  id: string
  original_content_id: string
  remix_type: string
  remixed_content: string
  metadata: Record<string, any> | null
  created_at: string
  original_content?: {
    content: string
    created_at: string
  }
}

function App() {
  const [inputText, setInputText] = useState('')
  const [linkedInPosts, setLinkedInPosts] = useState<LinkedInPost[]>([])
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingSaved, setIsLoadingSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState<number | null>(null)

  // Load saved posts on component mount
  useEffect(() => {
    loadSavedPosts()
  }, [])

  const loadSavedPosts = async () => {
    setIsLoadingSaved(true)
    try {
      const posts = await getAllRemixOutputs()
      // Filter for LinkedIn posts only
      const linkedInPosts = posts.filter(post => 
        post.remix_type.startsWith('linkedin_')
      )
      setSavedPosts(linkedInPosts)
    } catch (error) {
      console.error('Error loading saved posts:', error)
    } finally {
      setIsLoadingSaved(false)
    }
  }

  const handleRemix = async () => {
    if (!inputText.trim()) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const postTypes = ['storytelling', 'insights', 'tips', 'question', 'achievement', 'industry_trend']
      const results = await remixContent({
        content: inputText,
        remixTypes: postTypes
      })
      
      setLinkedInPosts(results.map(post => ({ ...post, saved: false, deleted: false })))
    } catch (err) {
      console.error('Error remixing content:', err)
      setError(err instanceof Error ? err.message : 'Failed to remix content')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (index: number) => {
    const post = linkedInPosts[index]
    if (post.saved) return
    
    setSaving(index)
    
    try {
      console.log('Starting save process...')
      
      // Save the original content first
      const originalContent = await saveOriginalContent(inputText)
      console.log('Original content saved:', originalContent)
      
      if (!originalContent) {
        throw new Error('Failed to save original content')
      }

      // Save the LinkedIn post
      const savedPost = await saveRemixOutput(
        originalContent.id,
        `linkedin_${post.type}`,
        post.content,
        {
          ...post.metadata,
          platform: 'linkedin',
          postType: post.type
        }
      )

      console.log('LinkedIn post saved:', savedPost)

      if (savedPost) {
        // Update the UI to show it's saved
        setLinkedInPosts(prev => 
          prev.map((p, i) => 
            i === index ? { ...p, saved: true } : p
          )
        )
        console.log('Post saved to database:', savedPost)
        
        // Reload saved posts to show the new one
        await loadSavedPosts()
      }
    } catch (error) {
      console.error('Error saving post:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      alert(`Failed to save post: ${errorMessage}`)
    } finally {
      setSaving(null)
    }
  }

  const handleDelete = (index: number) => {
    setLinkedInPosts(prev => 
      prev.map((post, i) => 
        i === index ? { ...post, deleted: true } : post
      )
    )
  }

  const handleLinkedInShare = (post: LinkedInPost | SavedPost) => {
    // Create LinkedIn share URL
    const text = encodeURIComponent('content' in post ? post.content : post.remixed_content)
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent('Check out this post')}&summary=${text}`
    window.open(linkedInUrl, '_blank')
  }

  const getPostTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      storytelling: 'Story',
      insights: 'Insights',
      tips: 'Tips & Advice',
      question: 'Discussion',
      achievement: 'Achievement',
      industry_trend: 'Industry Trend'
    }
    return labels[type] || type
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Main Content Area */}
        <div className="flex-1 py-8 px-4 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
              LinkedIn Post Generator
            </h1>
            
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <label htmlFor="input-text" className="block text-sm font-medium text-gray-700 mb-2">
                Paste your content here to generate LinkedIn posts:
              </label>
              <textarea
                id="input-text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter your content, article, or ideas here..."
                className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              
              <button
                onClick={handleRemix}
                disabled={isLoading || !inputText.trim()}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Generating LinkedIn Posts...' : 'Generate LinkedIn Posts'}
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {linkedInPosts.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Generated LinkedIn Posts</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {linkedInPosts.map((post, index) => (
                    !post.deleted && (
                      <div key={index} className={`border rounded-lg p-4 ${post.saved ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}>
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                            {getPostTypeLabel(post.type)}
                          </span>
                          {post.metadata?.usage && (
                            <span className="text-xs text-gray-500">
                              {post.metadata.usage.total_tokens} tokens
                            </span>
                          )}
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                            {post.content}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleLinkedInShare(post)}
                            className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                          >
                            Share on LinkedIn
                          </button>
                          <button
                            onClick={() => handleSave(index)}
                            disabled={post.saved || saving === index}
                            className={`px-3 py-2 text-sm rounded-md transition-colors ${
                              post.saved
                                ? 'bg-green-100 text-green-700 cursor-default'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {saving === index ? 'Saving...' : post.saved ? '✓ Saved' : 'Save'}
                          </button>
                          <button
                            onClick={() => handleDelete(index)}
                            className="px-3 py-2 bg-red-100 text-red-700 text-sm rounded-md hover:bg-red-200 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Saved Posts Sidebar */}
        <div className="sidebar bg-white border-l border-gray-200 p-4 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Saved Posts</h2>
            <button
              onClick={loadSavedPosts}
              disabled={isLoadingSaved}
              className="text-xs text-blue-600 hover:text-blue-800 disabled:text-gray-400"
            >
              {isLoadingSaved ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {savedPosts.length === 0 ? (
            <div className="text-center text-gray-500 py-6">
              <p className="text-sm">No saved posts yet</p>
              <p className="text-xs mt-1">Save some posts to see them here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedPosts.map((post) => (
                <div key={post.id} className="saved-post-box bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full border border-blue-100">
                      {getPostTypeLabel(post.remix_type.replace('linkedin_', ''))}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDate(post.created_at)}
                    </span>
                  </div>
                  
                  <div className="mb-3">
                    <p className="saved-post-content text-gray-700 whitespace-pre-wrap text-xs leading-relaxed">
                      {post.remixed_content}
                    </p>
                  </div>

                  <div className="flex gap-1">
                    <button
                      onClick={() => handleLinkedInShare(post)}
                      className="flex-1 px-2 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      Share
                    </button>
                    <button
                      onClick={() => navigator.clipboard.writeText(post.remixed_content)}
                      className="px-2 py-1.5 bg-gray-100 text-gray-600 text-xs rounded-lg hover:bg-gray-200 transition-colors shadow-sm"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App

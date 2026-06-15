import { useState } from 'react'
import './index.css'

// Hardcoded suggestions for dynamic UI
const COURSE_SUGGESTIONS = [
  "UX Design",
  "Software Engineering",
  "Data Science",
  "AI Governance",
  "Marketing"
];

const TOPIC_SUGGESTIONS = {
  "UX Design": ["Affinity Mapping", "Wireframing", "User Research", "Prototyping"],
  "Software Engineering": ["System Design", "React Hooks", "API Development", "Testing"],
  "Data Science": ["Machine Learning", "Data Cleaning", "Data Visualization", "Python Pandas"],
  "AI Governance": ["Input Guardrails", "Bias Mitigation", "Data Privacy", "Ethics"],
  "Marketing": ["SEO Strategies", "Content Marketing", "Social Media", "Email Campaigns"]
};

const DEFAULT_TOPIC_SUGGESTIONS = ["Core Concepts", "Best Practices", "Common Pitfalls"];

function App() {
  const [formData, setFormData] = useState({
    course: 'UX Design',
    topic: 'Affinity Mapping',
    difficulty: 'Intermediate',
    num_questions: 3,
    question_type: 'Scenario-based'
  })

  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'num_questions' ? parseInt(value) : value
    }))
  }

  // Helper to update form data when a suggestion chip is clicked
  const handleSuggestionClick = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const response = await fetch('http://localhost:8000/api/generate_quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Failed to generate quiz')
      }

      const data = await response.json()
      setResults(data.questions)
    } catch (err) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Determine which topics to show based on the current course
  const currentTopicSuggestions = TOPIC_SUGGESTIONS[formData.course] || DEFAULT_TOPIC_SUGGESTIONS;

  return (
    <div className="container">
      <header>
        <h1>Quiz Configuration</h1>
        <p className="subtitle">Configure settings to generate a new assessment.</p>
      </header>

      <main>
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              
              <div className="form-group full-width">
                <label htmlFor="course">Course Name</label>
                <input type="text" id="course" name="course" value={formData.course} onChange={handleChange} required />
                <div className="suggestion-chips">
                  {COURSE_SUGGESTIONS.map(course => (
                    <span 
                      key={course} 
                      className="chip" 
                      onClick={() => handleSuggestionClick('course', course)}
                    >
                      {course}
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-group full-width">
                <label htmlFor="topic">Topic / Subject</label>
                <input type="text" id="topic" name="topic" value={formData.topic} onChange={handleChange} required />
                <div className="suggestion-chips">
                  {currentTopicSuggestions.map(topic => (
                    <span 
                      key={topic} 
                      className="chip" 
                      onClick={() => handleSuggestionClick('topic', topic)}
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="difficulty">Difficulty Level</label>
                <select id="difficulty" name="difficulty" value={formData.difficulty} onChange={handleChange}>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="question_type">Question Type</label>
                <select id="question_type" name="question_type" value={formData.question_type} onChange={handleChange}>
                  <option value="Multiple Choice (MCQ)">Multiple Choice (MCQ)</option>
                  <option value="True/False">True/False</option>
                  <option value="Short Answer">Short Answer</option>
                  <option value="Scenario-based">Scenario-based</option>
                </select>
              </div>

              <div className="form-group full-width">
                <label htmlFor="num_questions">Number of Questions (1-10)</label>
                <input type="number" id="num_questions" name="num_questions" min="1" max="10" value={formData.num_questions} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-actions">
              {loading ? (
                <div className="loader">
                  <div className="spinner"></div>
                  Generating...
                </div>
              ) : (
                <button type="submit" className="btn-primary" disabled={loading}>
                  Generate Quiz
                </button>
              )}
            </div>
            
            {error && <div style={{color: 'var(--danger)', marginTop: '1rem', fontSize: '0.875rem'}}>{error}</div>}
          </form>
        </div>

        {results && (
          <div className="results-container">
            <h2 className="section-title">Generated Assessment</h2>
            
            {results.map((q, index) => (
              <div key={index} className="card question-card">
                
                <div className="question-header">
                  <h3>Question {index + 1}</h3>
                  <span className="difficulty-badge">{q.difficulty}</span>
                </div>
                
                <p className="question-text">{q.question}</p>
                
                {q.options && q.options.length > 0 && (
                  <ul className="options-list">
                    {q.options.map((opt, i) => (
                      <li key={i} className={`option-item ${opt === q.correct_answer ? 'correct' : ''}`}>
                        {opt} {opt === q.correct_answer && '✓'}
                      </li>
                    ))}
                  </ul>
                )}

                {(!q.options || q.options.length === 0) && (
                  <div className="ideal-answer">
                    <strong>Ideal Answer:</strong> {q.correct_answer}
                  </div>
                )}

                <div className="explanation-box">
                  <h4>Explanation</h4>
                  <p>{q.explanation}</p>
                </div>
                
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default App

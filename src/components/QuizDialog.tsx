"use client"
import * as React from "react"
import { Icon } from "./Icons"

export type Question = {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export function QuizDialog({ open, onOpenChange, content, title }: { open: boolean, onOpenChange: (open: boolean) => void, content: string, title: string }) {
  const [state, setState] = React.useState<'idle' | 'generating' | 'playing' | 'finished'>('idle')
  const [questions, setQuestions] = React.useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [selectedOption, setSelectedOption] = React.useState<number | null>(null)
  const [hasChecked, setHasChecked] = React.useState(false)
  const [score, setScore] = React.useState(0)

  // Reset when opened
  React.useEffect(() => {
    if (open) {
      setState('idle')
      setQuestions([])
      setCurrentIndex(0)
      setSelectedOption(null)
      setHasChecked(false)
      setScore(0)
    }
  }, [open])

  const generateQuiz = async () => {
    setState('generating')
    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      })
      if (!res.ok) throw new Error("Failed to generate quiz")
      const data = await res.json()
      setQuestions(data.questions || [])
      setState('playing')
    } catch (e) {
      console.error(e)
      alert("Failed to generate quiz. Try again.")
      setState('idle')
    }
  }

  const handleCheck = () => {
    if (selectedOption === null) return
    setHasChecked(true)
    if (selectedOption === questions[currentIndex].correctAnswerIndex) {
      setScore(s => s + 1)
    }
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(c => c + 1)
      setSelectedOption(null)
      setHasChecked(false)
    } else {
      setState('finished')
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => onOpenChange(false)}>
      <div 
        className="w-full max-w-2xl bg-[var(--bg-1)] border border-[var(--bd-1)] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--bd-1)] shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--acc-soft)] text-[var(--acc)]">
              <Icon name="sparkles" size={16} />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-[var(--fg-0)]">AI Quiz: {title}</h2>
              <p className="text-[12px] text-[var(--fg-3)]">Powered by Gemini</p>
            </div>
          </div>
          <button onClick={() => onOpenChange(false)} className="p-2 rounded-md hover:bg-[var(--bg-2)] text-[var(--fg-2)]">
            <Icon name="x" size={16} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 flex flex-col justify-center">
          {state === 'idle' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-[var(--bg-2)] border border-[var(--bd-1)] mx-auto mb-4 flex items-center justify-center text-[var(--fg-2)]">
                <Icon name="file-text" size={24} />
              </div>
              <h3 className="text-[16px] font-medium text-[var(--fg-0)] mb-2">Ready to test your knowledge?</h3>
              <p className="text-[13px] text-[var(--fg-2)] max-w-md mx-auto mb-6">
                Vector will analyze this note and generate a quick multiple-choice quiz to help you reinforce what you've learned.
              </p>
              <button 
                onClick={generateQuiz}
                className="px-5 py-2.5 rounded-md text-[14px] font-medium text-white shadow-md transition-all hover:opacity-90 active:scale-95"
                style={{ background: "var(--acc)", border: "1px solid var(--acc)" }}
              >
                Generate Quiz
              </button>
            </div>
          )}

          {state === 'generating' && (
            <div className="text-center py-12 flex flex-col items-center">
              <Icon name="sparkles" size={32} className="text-[var(--acc)] animate-pulse mb-4" />
              <p className="text-[14px] font-medium text-[var(--fg-1)]">Reading your notes and creating questions...</p>
            </div>
          )}

          {state === 'playing' && questions.length > 0 && (
            <div className="max-w-xl mx-auto w-full">
              <div className="flex items-center justify-between mb-6">
                <span className="text-[12px] font-medium text-[var(--fg-3)] uppercase tracking-wider">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span className="text-[12px] font-semibold text-[var(--acc)]">Score: {score}</span>
              </div>
              
              <h3 className="text-[18px] font-medium text-[var(--fg-0)] mb-6 leading-snug">
                {questions[currentIndex].question}
              </h3>

              <div className="space-y-3 mb-8">
                {questions[currentIndex].options.map((opt, i) => {
                  const isSelected = selectedOption === i;
                  const isCorrect = i === questions[currentIndex].correctAnswerIndex;
                  
                  let btnClass = "border-[var(--bd-1)] bg-[var(--bg-2)] hover:border-[var(--fg-3)] text-[var(--fg-1)]";
                  
                  if (hasChecked) {
                    if (isCorrect) btnClass = "border-green-500 bg-green-500/10 text-green-500 font-medium";
                    else if (isSelected) btnClass = "border-red-500 bg-red-500/10 text-red-500 font-medium";
                    else btnClass = "border-[var(--bd-1)] bg-[var(--bg-1)] opacity-50";
                  } else if (isSelected) {
                    btnClass = "border-[var(--acc)] bg-[var(--acc-soft)] text-[var(--acc)] ring-1 ring-[var(--acc)]";
                  }

                  return (
                    <button
                      key={i}
                      disabled={hasChecked}
                      onClick={() => setSelectedOption(i)}
                      className={`w-full text-left px-4 py-3 rounded-lg border text-[14px] transition-all ${btnClass}`}
                    >
                      {opt}
                    </button>
                  )
                })}
              </div>

              {hasChecked && (
                <div className={`p-4 rounded-lg mb-6 border ${selectedOption === questions[currentIndex].correctAnswerIndex ? 'border-green-500/30 bg-green-500/5' : 'border-amber-500/30 bg-amber-500/5'}`}>
                  <div className={`font-semibold text-[13px] mb-1 ${selectedOption === questions[currentIndex].correctAnswerIndex ? 'text-green-500' : 'text-amber-500'}`}>
                    {selectedOption === questions[currentIndex].correctAnswerIndex ? 'Correct!' : 'Incorrect'}
                  </div>
                  <p className="text-[13px] text-[var(--fg-1)] leading-relaxed">
                    {questions[currentIndex].explanation}
                  </p>
                </div>
              )}

              <div className="flex justify-end border-t border-[var(--bd-1)] pt-4 mt-auto">
                {!hasChecked ? (
                  <button 
                    disabled={selectedOption === null}
                    onClick={handleCheck}
                    className="px-5 py-2 rounded-md text-[13px] font-medium bg-[var(--acc)] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Check Answer
                  </button>
                ) : (
                  <button 
                    onClick={handleNext}
                    className="px-5 py-2 rounded-md text-[13px] font-medium bg-[var(--fg-0)] text-[var(--bg-0)] hover:opacity-90"
                  >
                    {currentIndex < questions.length - 1 ? "Next Question" : "See Results"}
                  </button>
                )}
              </div>
            </div>
          )}

          {state === 'finished' && (
            <div className="text-center py-8 max-w-sm mx-auto">
              <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center border-4" 
                style={{ 
                  borderColor: score / questions.length >= 0.8 ? 'var(--acc)' : 
                              score / questions.length >= 0.5 ? 'var(--mag)' : 'var(--fg-3)'
                }}
              >
                <span className="text-[24px] font-bold text-[var(--fg-0)]">{Math.round((score / questions.length) * 100)}%</span>
              </div>
              <h3 className="text-[18px] font-semibold text-[var(--fg-0)] mb-2">Quiz Complete!</h3>
              <p className="text-[14px] text-[var(--fg-2)] mb-8">
                You got {score} out of {questions.length} questions correct.
              </p>
              <button 
                onClick={() => onOpenChange(false)}
                className="w-full px-5 py-2.5 rounded-md text-[14px] font-medium bg-[var(--bg-2)] border border-[var(--bd-1)] text-[var(--fg-1)] hover:text-[var(--fg-0)]"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

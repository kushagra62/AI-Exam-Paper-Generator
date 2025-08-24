
import React, { useState, useCallback } from 'react';
import type { Exam, Question } from './types';
import { generateExam } from './services/geminiService';

const ExamDisplay: React.FC<{ exam: Exam }> = ({ exam }) => {
  const [showAnswers, setShowAnswers] = useState<Record<number, boolean>>({});

  const toggleAnswer = (index: number) => {
    setShowAnswers(prev => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="w-full mt-8 bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-lg">
      <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white mb-6 text-center">Generated Exam</h2>
      <div className="space-y-6">
        {exam.map((item, index) => (
          <div key={index} className="border-b border-slate-200 dark:border-slate-700 pb-4 last:border-b-0">
            <p className="font-semibold text-lg text-slate-700 dark:text-slate-200 mb-2">
              <span className="text-sky-600 dark:text-sky-400">Q{index + 1}:</span> {item.question}
            </p>
            <button
              onClick={() => toggleAnswer(index)}
              className="text-sm text-sky-600 dark:text-sky-400 hover:underline focus:outline-none focus:ring-2 focus:ring-sky-500 rounded"
            >
              {showAnswers[index] ? 'Hide Answer' : 'Show Answer'}
            </button>
            {showAnswers[index] && (
              <p className="mt-2 p-3 bg-slate-100 dark:bg-slate-700 rounded-md text-slate-800 dark:text-slate-100">
                <span className="font-bold">Answer:</span> {item.answer}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [topic, setTopic] = useState<string>('Algebra');
  const [numQuestions, setNumQuestions] = useState<string>('5');
  const [exam, setExam] = useState<Exam | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateExam = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const questionCount = parseInt(numQuestions, 10);

    if (!topic.trim()) {
      setError('Please enter a math topic.');
      return;
    }
    if (isNaN(questionCount) || questionCount <= 0 || questionCount > 20) {
      setError('Please enter a valid number of questions (1-20).');
      return;
    }

    setIsLoading(true);
    setError(null);
    setExam(null);

    try {
      const generatedExam = await generateExam(topic, questionCount);
      setExam(generatedExam);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [topic, numQuestions]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 p-4">
      <div className="w-full max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white">
            Math Exam Generator
          </h1>
          <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
            Create custom math quizzes with the power of AI.
          </p>
        </header>

        <main className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-lg">
          <form onSubmit={handleGenerateExam} className="space-y-6">
            <div>
              <label htmlFor="topic" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Math Topic
              </label>
              <input
                id="topic"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., 'Fractions', 'Calculus'"
                className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
                required
              />
            </div>

            <div>
              <label htmlFor="numQuestions" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Number of Questions
              </label>
              <input
                id="numQuestions"
                type="number"
                value={numQuestions}
                onChange={(e) => setNumQuestions(e.target.value)}
                min="1"
                max="20"
                className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-sky-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-500/50 transition-transform transform active:scale-95 disabled:bg-slate-400 disabled:dark:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                'Generate Exam'
              )}
            </button>
          </form>
        </main>
        
        <div className="mt-8">
            {error && (
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-center" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
            </div>
            )}

            {!isLoading && exam && <ExamDisplay exam={exam} />}
        </div>
        
      </div>
    </div>
  );
};

export default App;

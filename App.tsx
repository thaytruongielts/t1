import React, { useState, useCallback } from 'react';
import { getIeltsFeedback } from './services/geminiService';
import EvaluationDisplay from './components/EvaluationDisplay';
import { CHARTS } from './data/charts';
import type { Chart, Evaluation } from './types';

const App: React.FC = () => {
  const [currentChart, setCurrentChart] = useState<Chart>(CHARTS[0]);
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleNewChart = useCallback(() => {
    let newChart: Chart;
    do {
      const randomIndex = Math.floor(Math.random() * CHARTS.length);
      newChart = CHARTS[randomIndex];
    } while (newChart.id === currentChart.id);
    
    setCurrentChart(newChart);
    setUserAnswer("");
    setEvaluation(null);
    setError(null);
  }, [currentChart]);

  const handleSubmit = useCallback(async () => {
    if (!userAnswer.trim() || isLoading) return;

    setIsLoading(true);
    setEvaluation(null);
    setError(null);

    try {
      const result = await getIeltsFeedback(currentChart.title, userAnswer);
      setEvaluation(result);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [userAnswer, isLoading, currentChart]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4 font-sans bg-slate-100">
      <main className="w-full max-w-4xl mx-auto space-y-6 py-8">
        <header className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800">IELTS Writing Task 1 Practice</h1>
          <p className="text-slate-600 mt-2 text-lg">Paraphrase the introduction and get instant feedback.</p>
        </header>

        {/* Chart Display Area */}
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 w-full">
          <h2 className="text-xl font-semibold text-slate-800 mb-4 text-center">{currentChart.title}</h2>
          <div className="flex justify-center mb-4 bg-slate-50 p-4 rounded-lg">
            <img src={currentChart.image} alt="IELTS Task 1 Chart" className="max-w-full h-auto rounded-md shadow-md" style={{maxHeight: '400px'}} />
          </div>
           <button
            onClick={handleNewChart}
            className="w-full px-6 py-2 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition-colors"
          >
            Get a New Chart
          </button>
        </div>

        {/* User Input Area */}
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 w-full">
          <label htmlFor="user-answer" className="block text-lg font-semibold text-slate-800 mb-3">
            Your Paraphrased Introduction
          </label>
          <textarea
            id="user-answer"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Write your introduction here..."
            className="w-full h-32 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
            aria-label="Your paraphrased introduction"
          />
          <button
            onClick={handleSubmit}
            disabled={!userAnswer.trim() || isLoading}
            className="mt-4 w-full px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-all transform hover:scale-105 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Evaluating...
              </>
            ) : (
                'Get Feedback'
            )}
          </button>
        </div>
        
        {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow animate-fade-in" role="alert">
                <p className="font-bold">Error</p>
                <p>{error}</p>
            </div>
        )}

        {evaluation && !isLoading && (
          <EvaluationDisplay evaluation={evaluation} />
        )}

      </main>
      <footer className="text-center mt-4 pb-8 text-slate-500">
        <p>Powered by Gemini</p>
      </footer>
    </div>
  );
};

export default App;

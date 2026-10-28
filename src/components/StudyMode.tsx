import { useState } from 'react';
import { Question } from '../data/questions';

interface Props {
  questions: Question[];
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  onBack: () => void;
}

export default function StudyMode({ questions, currentIndex, setCurrentIndex, onBack }: Props) {
  const [showAnswer, setShowAnswer] = useState(true);
  const question = questions[currentIndex];

  const goNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(true);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(true);
    }
  };

  const goToQuestion = (index: number) => {
    setCurrentIndex(index);
    setShowAnswer(true);
  };

  const getOptionLetter = (option: string) => {
    return option.charAt(0);
  };

  const isCorrectOption = (option: string) => {
    return question.answers.includes(getOptionLetter(option));
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Main Question Area */}
      <div className="flex-1">
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">
              第 {currentIndex + 1} / {questions.length} 题
            </span>
            <span className="text-sm text-blue-400">背题模式</span>
          </div>
          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 shadow-xl">
          <div className="flex items-start gap-3 mb-6">
            <span className="flex-shrink-0 w-8 h-8 bg-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center text-sm font-bold">
              {question.id}
            </span>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  question.answers.length > 1
                    ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                }`}>
                  {question.answers.length > 1 ? '多选题' : '单选题'}
                </span>
              </div>
              <h2 className="text-lg font-medium text-white leading-relaxed">
                {question.question}
              </h2>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3 mb-6">
            {question.options.map((option, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border transition-all ${
                  showAnswer
                    ? isCorrectOption(option)
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200'
                      : 'bg-slate-700/30 border-slate-600/30 text-slate-400'
                    : 'bg-slate-700/30 border-slate-600/30 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  {showAnswer && isCorrectOption(option) && (
                    <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {showAnswer && !isCorrectOption(option) && (
                    <svg className="w-5 h-5 text-slate-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  <span className="text-sm leading-relaxed">{option}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Answer & Explanation */}
          <div className="space-y-4">
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-blue-300 font-medium text-sm">正确答案</span>
              </div>
              <p className="text-blue-200 font-bold text-lg">{question.answers.join('')}</p>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-amber-300 font-medium text-sm">解析</span>
              </div>
              <p className="text-amber-100/80 text-sm leading-relaxed">{question.explanation}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-700/50 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-xl transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            上一题
          </button>
          <button
            onClick={goNext}
            disabled={currentIndex === questions.length - 1}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-xl transition-all"
          >
            下一题
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Question Navigator Sidebar */}
      <div className="lg:w-64 bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-4 h-fit lg:sticky lg:top-20">
        <h3 className="text-white font-medium text-sm mb-3">题目导航</h3>
        <div className="grid grid-cols-6 lg:grid-cols-5 gap-2">
          {questions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToQuestion(idx)}
              className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                idx === currentIndex
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50 hover:text-white'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Question } from '../data/questions';

interface WrongRecord {
  questionId: number;
  count: number;
}

interface Props {
  questions: Question[];
  wrongRecords: WrongRecord[];
  onRemove: (questionId: number) => void;
  onBack: () => void;
}

export default function SweepMode({ questions, wrongRecords, onRemove, onBack }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [streaks, setStreaks] = useState<Record<number, number>>({});
  const [sweptQuestions, setSweptQuestions] = useState<number[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);

  // Get wrong questions that haven't been swept yet
  const wrongQuestions = wrongRecords
    .filter(record => !sweptQuestions.includes(record.questionId))
    .map(record => {
      const question = questions.find(q => q.id === record.questionId);
      return question ? { question, streak: streaks[question.id] || 0 } : null;
    })
    .filter(Boolean) as { question: Question; streak: number }[];

  useEffect(() => {
    setSelectedAnswers([]);
    setSubmitted(false);
    setIsCorrect(false);
  }, [currentIndex]);

  const currentQuestion = wrongQuestions[currentIndex];

  const toggleAnswer = (letter: string) => {
    if (submitted) return;
    setSelectedAnswers(prev =>
      prev.includes(letter) ? prev.filter(a => a !== letter) : [...prev, letter]
    );
  };

  const handleSubmit = () => {
    if (selectedAnswers.length === 0 || !currentQuestion) return;
    setSubmitted(true);
    const correct =
      selectedAnswers.length === currentQuestion.question.answers.length &&
      selectedAnswers.every(a => currentQuestion.question.answers.includes(a));
    setIsCorrect(correct);

    if (correct) {
      const newStreak = (streaks[currentQuestion.question.id] || 0) + 1;
      setStreaks(prev => ({ ...prev, [currentQuestion.question.id]: newStreak }));

      if (newStreak >= 3) {
        // Sweep this question - remove from wrong records
        setTimeout(() => {
          onRemove(currentQuestion.question.id);
          setSweptQuestions(prev => [...prev, currentQuestion.question.id]);
          setShowCelebration(true);
          setTimeout(() => setShowCelebration(false), 2000);
        }, 1000);
      }
    } else {
      // Reset streak on wrong answer
      setStreaks(prev => ({ ...prev, [currentQuestion.question.id]: 0 }));
    }
  };

  const goNext = () => {
    if (currentIndex < wrongQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (wrongQuestions.length > 1) {
      // Loop back to start
      setCurrentIndex(0);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (wrongQuestions.length > 1) {
      // Loop to end
      setCurrentIndex(wrongQuestions.length - 1);
    }
  };

  const getOptionLetter = (option: string) => option.charAt(0);

  const getOptionStyle = (option: string) => {
    const letter = getOptionLetter(option);
    const isSelected = selectedAnswers.includes(letter);
    const isAnswer = currentQuestion.question.answers.includes(letter);

    if (!submitted) {
      if (isSelected) {
        return 'bg-purple-500/20 border-purple-500/50 text-purple-200 ring-2 ring-purple-500/30';
      }
      return 'bg-slate-700/30 border-slate-600/30 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500/50 cursor-pointer';
    }

    // After submission
    if (isAnswer) {
      return 'bg-emerald-500/15 border-emerald-500/50 text-emerald-200';
    }
    if (isSelected && !isAnswer) {
      return 'bg-red-500/15 border-red-500/50 text-red-200';
    }
    return 'bg-slate-700/20 border-slate-600/20 text-slate-500';
  };

  if (wrongRecords.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-24 h-24 bg-purple-500/10 rounded-full flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">暂无错题</h2>
        <p className="text-slate-400 mb-6">先去刷题模式积累一些错题吧！</p>
        <button
          onClick={onBack}
          className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-all"
        >
          返回首页
        </button>
      </div>
    );
  }

  if (wrongQuestions.length === 0 && sweptQuestions.length > 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <svg className="w-12 h-12 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">恭喜！所有错题已扫除！</h2>
        <p className="text-slate-400 mb-6">你已经掌握了所有错题，太棒了！</p>
        <button
          onClick={onBack}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all"
        >
          返回首页
        </button>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-slate-400 mb-6">没有可练习的题目</p>
        <button
          onClick={onBack}
          className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-all"
        >
          返回首页
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Celebration Overlay */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 shadow-2xl animate-bounce">
            <div className="text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">错题已清除！</h3>
              <p className="text-emerald-100">连续答对3次，成功掌握！</p>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-400">
            第 {currentIndex + 1} / {wrongQuestions.length} 题
          </span>
          <span className="text-sm text-purple-400">错题扫除模式</span>
        </div>
        <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-violet-400 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / wrongQuestions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 shadow-xl">
        <div className="flex items-start gap-3 mb-6">
          <span className="flex-shrink-0 w-8 h-8 bg-purple-500/20 text-purple-400 rounded-lg flex items-center justify-center text-sm font-bold">
            {currentQuestion.question.id}
          </span>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                currentQuestion.question.answers.length > 1
                  ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              }`}>
                {currentQuestion.question.answers.length > 1 ? '多选题' : '单选题'}
              </span>
              <span className="text-xs text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">
                连续答对 {currentQuestion.streak}/3
              </span>
            </div>
            <h2 className="text-lg font-medium text-white leading-relaxed">
              {currentQuestion.question.question}
            </h2>
          </div>
        </div>

        {/* Streak Progress */}
        <div className="mb-6 bg-slate-700/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">掌握进度</span>
            <span className="text-sm text-purple-300 font-medium">{currentQuestion.streak}/3</span>
          </div>
          <div className="flex gap-2">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className={`flex-1 h-2 rounded-full transition-all ${
                  i < currentQuestion.streak
                    ? 'bg-gradient-to-r from-purple-500 to-violet-400'
                    : 'bg-slate-600'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {currentQuestion.question.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => toggleAnswer(getOptionLetter(option))}
              disabled={submitted}
              className={`w-full p-4 rounded-xl border transition-all text-left ${getOptionStyle(option)}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                  selectedAnswers.includes(getOptionLetter(option))
                    ? submitted
                      ? currentQuestion.question.answers.includes(getOptionLetter(option))
                        ? 'border-emerald-400 bg-emerald-400/20'
                        : 'border-red-400 bg-red-400/20'
                      : 'border-purple-400 bg-purple-400/20'
                    : 'border-slate-500'
                }`}>
                  {submitted && currentQuestion.question.answers.includes(getOptionLetter(option)) && (
                    <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {submitted && selectedAnswers.includes(getOptionLetter(option)) && !currentQuestion.question.answers.includes(getOptionLetter(option)) && (
                    <svg className="w-3.5 h-3.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  {!submitted && selectedAnswers.includes(getOptionLetter(option)) && (
                    <div className="w-2.5 h-2.5 rounded-sm bg-purple-400" />
                  )}
                </div>
                <span className="text-sm leading-relaxed">{option}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Submit Button */}
        {!submitted && (
          <button
            onClick={handleSubmit}
            disabled={selectedAnswers.length === 0}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all shadow-lg shadow-purple-500/20"
          >
            提交答案
          </button>
        )}

        {/* Result & Explanation */}
        {submitted && (
          <div className="space-y-4">
            {/* Result Badge */}
            <div className={`flex items-center gap-3 p-4 rounded-xl border ${
              isCorrect
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-red-500/10 border-red-500/30'
            }`}>
              {isCorrect ? (
                <>
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-emerald-300 font-bold">回答正确！</p>
                    <p className="text-emerald-400/70 text-sm">
                      {currentQuestion.streak + 1 >= 3 ? '即将清除该错题！' : `继续加油，还需答对 ${3 - currentQuestion.streak - 1} 次`}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-red-300 font-bold">回答错误</p>
                    <p className="text-red-400/70 text-sm">正确答案：{currentQuestion.question.answers.join('')} · 连续答对次数已重置</p>
                  </div>
                </>
              )}
            </div>

            {/* Correct Answer */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-blue-300 font-medium text-sm">正确答案</span>
              </div>
              <p className="text-blue-200 font-bold text-lg">{currentQuestion.question.answers.join('')}</p>
            </div>

            {/* Explanation */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-amber-300 font-medium text-sm">解析</span>
              </div>
              <p className="text-amber-100/80 text-sm leading-relaxed">{currentQuestion.question.explanation}</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={goPrev}
          disabled={wrongQuestions.length <= 1}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-700/50 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-xl transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          上一题
        </button>
        <button
          onClick={goNext}
          disabled={wrongQuestions.length <= 1}
          className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-xl transition-all"
        >
          下一题
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Question Navigator */}
      <div className="mt-6 bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-4">
        <h3 className="text-white font-medium text-sm mb-3">错题列表</h3>
        <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-10 gap-2">
          {wrongQuestions.map((item, idx) => (
            <button
              key={item.question.id}
              onClick={() => setCurrentIndex(idx)}
              className={`w-8 h-8 rounded-lg text-xs font-medium transition-all relative ${
                idx === currentIndex
                  ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                  : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50 hover:text-white'
              }`}
            >
              {item.question.id}
              {item.streak > 0 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full" />
              )}
            </button>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-purple-500" />
            <span>当前题目</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-400" />
            <span>有答对记录</span>
          </div>
        </div>
      </div>
    </div>
  );
}

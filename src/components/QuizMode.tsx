import { useState, useEffect } from 'react';
import { Question } from '../data/questions';

interface QuizRecord {
  questionId: number;
  userAnswers: string[];
  isCorrect: boolean;
  timestamp: number;
}

interface Props {
  questions: Question[];
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  onBack: () => void;
  onWrong: (questionId: number) => void;
  quizRecords: QuizRecord[];
  onSaveRecord: (questionId: number, userAnswers: string[], isCorrect: boolean) => void;
}

export default function QuizMode({ questions, currentIndex, setCurrentIndex, onBack, onWrong, quizRecords, onSaveRecord }: Props) {
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [wrongRecorded, setWrongRecorded] = useState(false);
  const [wrongQuestionIds, setWrongQuestionIds] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(0);

  const question = questions[currentIndex];
  
  // 分页配置：每页16行，每行10个题目，共5页
  const ROWS_PER_PAGE = 16;
  const COLS_PER_ROW = 10;
  const QUESTIONS_PER_PAGE = ROWS_PER_PAGE * COLS_PER_ROW; // 160
  const TOTAL_PAGES = 5;
  
  const goToPage = (page: number) => {
    if (page >= 0 && page < TOTAL_PAGES) {
      setCurrentPage(page);
    }
  };
  
  // 检查当前题目是否已经回答过
  const existingRecord = quizRecords.find(r => r.questionId === question.id);
  const hasAnswered = !!existingRecord;

  useEffect(() => {
    // 如果题目已经回答过，恢复之前的答案和状态
    if (existingRecord) {
      setSelectedAnswers(existingRecord.userAnswers);
      setSubmitted(true);
      setIsCorrect(existingRecord.isCorrect);
      setWrongRecorded(!existingRecord.isCorrect);
    } else {
      setSelectedAnswers([]);
      setSubmitted(false);
      setIsCorrect(false);
      setWrongRecorded(false);
    }
  }, [currentIndex, existingRecord]);

  const toggleAnswer = (letter: string) => {
    if (submitted) return;
    setSelectedAnswers(prev =>
      prev.includes(letter) ? prev.filter(a => a !== letter) : [...prev, letter]
    );
  };

  const handleSubmit = () => {
    if (selectedAnswers.length === 0) return;
    setSubmitted(true);
    const correct =
      selectedAnswers.length === question.answers.length &&
      selectedAnswers.every(a => question.answers.includes(a));
    setIsCorrect(correct);
    
    // 保存答题记录
    onSaveRecord(question.id, selectedAnswers, correct);
    
    if (!correct && !wrongRecorded) {
      onWrong(question.id);
      setWrongQuestionIds(prev => new Set(prev).add(question.id));
      setWrongRecorded(true);
    }
  };

  const goNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const getOptionLetter = (option: string) => option.charAt(0);

  const getOptionStyle = (option: string) => {
    const letter = getOptionLetter(option);
    const isSelected = selectedAnswers.includes(letter);
    const isAnswer = question.answers.includes(letter);

    if (!submitted) {
      if (isSelected) {
        return 'bg-blue-500/20 border-blue-500/50 text-blue-200 ring-2 ring-blue-500/30';
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
            <div className="flex items-center gap-2">
              {hasAnswered && (
                <span className="text-xs px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded-full">
                  已作答
                </span>
              )}
              <span className="text-sm text-emerald-400">刷题模式</span>
            </div>
          </div>
          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 shadow-xl">
          <div className="flex items-start gap-3 mb-6">
            <span className="flex-shrink-0 w-8 h-8 bg-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center text-sm font-bold">
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
                        ? question.answers.includes(getOptionLetter(option))
                          ? 'border-emerald-400 bg-emerald-400/20'
                          : 'border-red-400 bg-red-400/20'
                        : 'border-blue-400 bg-blue-400/20'
                      : 'border-slate-500'
                  }`}>
                    {submitted && question.answers.includes(getOptionLetter(option)) && (
                      <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {submitted && selectedAnswers.includes(getOptionLetter(option)) && !question.answers.includes(getOptionLetter(option)) && (
                      <svg className="w-3.5 h-3.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                    {!submitted && selectedAnswers.includes(getOptionLetter(option)) && (
                      <div className="w-2.5 h-2.5 rounded-sm bg-blue-400" />
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
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all shadow-lg shadow-emerald-500/20"
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
                      <p className="text-emerald-400/70 text-sm">继续保持！</p>
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
                      <p className="text-red-400/70 text-sm">正确答案：{question.answers.join('')} · 已记入错题本</p>
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
                <p className="text-blue-200 font-bold text-lg">{question.answers.join('')}</p>
              </div>

              {/* Explanation */}
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
          )}
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
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-xl transition-all"
          >
            下一题
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Question Navigator Sidebar */}
      <div className="lg:w-80 bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-4 h-fit lg:sticky lg:top-20">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-medium text-sm">题目导航</h3>
          <span className="text-xs text-slate-400">第 {currentPage + 1} / {TOTAL_PAGES} 页</span>
        </div>
        
        {/* 题目网格 */}
        <div className="space-y-2 mb-4">
          {Array.from({ length: ROWS_PER_PAGE }).map((_, rowIndex) => {
            const startIndex = currentPage * QUESTIONS_PER_PAGE + rowIndex * COLS_PER_ROW;
            const endIndex = Math.min(startIndex + COLS_PER_ROW, questions.length);
            
            if (startIndex >= questions.length) return null;
            
            return (
              <div key={rowIndex} className="flex gap-1">
                {Array.from({ length: COLS_PER_ROW }).map((_, colIndex) => {
                  const questionIndex = startIndex + colIndex;
                  if (questionIndex >= questions.length) {
                    return <div key={colIndex} className="w-8 h-8" />;
                  }
                  
                  const q = questions[questionIndex];
                  const record = quizRecords.find(r => r.questionId === q.id);
                  const isAnswered = !!record;
                  const isCurrentQuestion = questionIndex === currentIndex;
                  
                  return (
                    <button
                      key={colIndex}
                      onClick={() => setCurrentIndex(questionIndex)}
                      className={`w-8 h-8 rounded-lg text-xs font-medium transition-all relative ${
                        isCurrentQuestion
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                          : isAnswered
                          ? record?.isCorrect
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50 hover:text-white'
                      }`}
                    >
                      {questionIndex + 1}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
        
        {/* 分页按钮 */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-700/50 mb-3">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 0}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            上一页
          </button>
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === TOTAL_PAGES - 1}
            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-all"
          >
            下一页
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        {/* 图例 */}
        <div className="pt-3 border-t border-slate-700/50">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <div className="w-3 h-3 rounded bg-emerald-500" />
            <span>当前题目</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <div className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/30" />
            <span>答对题目</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <div className="w-3 h-3 rounded bg-red-500/20 border border-red-500/30" />
            <span>答错题目</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <div className="w-3 h-3 rounded bg-slate-700/50" />
            <span>未答题目</span>
          </div>
        </div>
      </div>
    </div>
  );
}

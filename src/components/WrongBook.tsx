import { useState } from 'react';
import { Question } from '../data/questions';

interface WrongRecord {
  questionId: number;
  count: number;
}

interface Props {
  questions: Question[];
  wrongRecords: WrongRecord[];
  onRemove: (questionId: number) => void;
  onClear: () => void;
  onBack: () => void;
  onStudyWrong: (index: number) => void;
}

export default function WrongBook({ questions, wrongRecords, onRemove, onClear, onBack, onStudyWrong }: Props) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'id' | 'count'>('count');

  const wrongQuestions = wrongRecords
    .map(record => {
      const question = questions.find(q => q.id === record.questionId);
      return question ? { question, count: record.count } : null;
    })
    .filter(Boolean) as { question: Question; count: number }[];

  const sortedQuestions = [...wrongQuestions].sort((a, b) => {
    if (sortBy === 'count') return b.count - a.count;
    return a.question.id - b.question.id;
  });

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (wrongRecords.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">暂无错题</h2>
        <p className="text-slate-400 mb-6">太棒了！还没有错题记录</p>
        <button
          onClick={onBack}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all"
        >
          返回首页
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <svg className="w-6 h-6 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            错题本
          </h2>
          <p className="text-slate-400 text-sm mt-1">共 {wrongRecords.length} 道错题</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-800/60 rounded-lg p-1">
            <button
              onClick={() => setSortBy('count')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                sortBy === 'count'
                  ? 'bg-rose-500/20 text-rose-300'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              按错次排序
            </button>
            <button
              onClick={() => setSortBy('id')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                sortBy === 'id'
                  ? 'bg-rose-500/20 text-rose-300'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              按题号排序
            </button>
          </div>
          <button
            onClick={onClear}
            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 text-sm rounded-lg transition-all"
          >
            清空错题
          </button>
        </div>
      </div>

      {/* Wrong Questions List */}
      <div className="space-y-4">
        {sortedQuestions.map(({ question, count }) => (
          <div
            key={question.id}
            className="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden shadow-lg"
          >
            {/* Question Header */}
            <div
              className="p-5 cursor-pointer hover:bg-slate-700/20 transition-all"
              onClick={() => toggleExpand(question.id)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <span className="flex-shrink-0 w-8 h-8 bg-rose-500/20 text-rose-400 rounded-lg flex items-center justify-center text-sm font-bold">
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
                    <h3 className="text-white font-medium leading-relaxed">
                      {question.question}
                    </h3>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">
                        错误 {count} 次
                      </span>
                      <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                        答案：{question.answers.join('')}
                      </span>
                    </div>
                  </div>
                </div>
                <svg
                  className={`w-5 h-5 text-slate-400 transition-transform flex-shrink-0 ${
                    expandedId === question.id ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Expanded Content */}
            {expandedId === question.id && (
              <div className="px-5 pb-5 border-t border-slate-700/50 pt-4">
                {/* Options */}
                <div className="space-y-2 mb-4">
                  {question.options.map((option, idx) => {
                    const letter = option.charAt(0);
                    const isCorrect = question.answers.includes(letter);
                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border ${
                          isCorrect
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                            : 'bg-slate-700/20 border-slate-600/20 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {isCorrect && (
                            <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                          <span className="text-sm">{option}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-amber-300 font-medium text-xs">解析</span>
                  </div>
                  <p className="text-amber-100/80 text-sm leading-relaxed">{question.explanation}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      const index = questions.findIndex(q => q.id === question.id);
                      if (index >= 0) onStudyWrong(index);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-sm rounded-lg transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    背题模式查看
                  </button>
                  <button
                    onClick={() => onRemove(question.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-sm rounded-lg transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    标记已掌握
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

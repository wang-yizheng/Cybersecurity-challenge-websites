import { useState, useEffect } from 'react';
import { questions } from './data/questions';
import StudyMode from './components/StudyMode';
import QuizMode from './components/QuizMode';
import WrongBook from './components/WrongBook';
import SweepMode from './components/SweepMode';

type Mode = 'home' | 'study' | 'quiz' | 'wrong' | 'sweep';

interface WrongRecord {
  questionId: number;
  count: number;
}

function App() {
  const [mode, setMode] = useState<Mode>('home');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wrongRecords, setWrongRecords] = useState<WrongRecord[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('wrongRecords');
    if (saved) {
      setWrongRecords(JSON.parse(saved));
    }
  }, []);

  const saveWrongRecords = (records: WrongRecord[]) => {
    setWrongRecords(records);
    localStorage.setItem('wrongRecords', JSON.stringify(records));
  };

  const addWrongRecord = (questionId: number) => {
    const existing = wrongRecords.find(r => r.questionId === questionId);
    let newRecords: WrongRecord[];
    if (existing) {
      newRecords = wrongRecords.map(r =>
        r.questionId === questionId ? { ...r, count: r.count + 1 } : r
      );
    } else {
      newRecords = [...wrongRecords, { questionId, count: 1 }];
    }
    saveWrongRecords(newRecords);
  };

  const removeWrongRecord = (questionId: number) => {
    const newRecords = wrongRecords.filter(r => r.questionId !== questionId);
    saveWrongRecords(newRecords);
  };

  const clearWrongRecords = () => {
    saveWrongRecords([]);
  };

  const wrongQuestionIds = wrongRecords.map(r => r.questionId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-blue-500/20 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-lg font-bold text-white hidden sm:block">网络安全与系统管理考试</h1>
            <h1 className="text-lg font-bold text-white sm:hidden">网安刷题</h1>
          </div>
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setMode('home')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                mode === 'home'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              首页
            </button>
            <button
              onClick={() => setMode('study')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                mode === 'study'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              背题
            </button>
            <button
              onClick={() => setMode('quiz')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                mode === 'quiz'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              刷题
            </button>
            <button
              onClick={() => setMode('wrong')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all relative ${
                mode === 'wrong'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              错题本
              {wrongRecords.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {wrongRecords.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setMode('sweep')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                mode === 'sweep'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              扫除
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {mode === 'home' && (
          <HomePage
            totalQuestions={questions.length}
            wrongCount={wrongRecords.length}
            onStudy={() => { setCurrentIndex(0); setMode('study'); }}
            onQuiz={() => { setCurrentIndex(0); setMode('quiz'); }}
            onWrong={() => setMode('wrong')}
            onSweep={() => setMode('sweep')}
          />
        )}
        {mode === 'study' && (
          <StudyMode
            questions={questions}
            currentIndex={currentIndex}
            setCurrentIndex={setCurrentIndex}
            onBack={() => setMode('home')}
          />
        )}
        {mode === 'quiz' && (
          <QuizMode
            questions={questions}
            currentIndex={currentIndex}
            setCurrentIndex={setCurrentIndex}
            onBack={() => setMode('home')}
            onWrong={addWrongRecord}
          />
        )}
        {mode === 'wrong' && (
          <WrongBook
            questions={questions}
            wrongRecords={wrongRecords}
            onRemove={removeWrongRecord}
            onClear={clearWrongRecords}
            onBack={() => setMode('home')}
            onStudyWrong={(index: number) => { setCurrentIndex(index); setMode('study'); }}
          />
        )}
        {mode === 'sweep' && (
          <SweepMode
            questions={questions}
            wrongRecords={wrongRecords}
            onRemove={removeWrongRecord}
            onBack={() => setMode('home')}
          />
        )}
      </main>
    </div>
  );
}

function HomePage({
  totalQuestions,
  wrongCount,
  onStudy,
  onQuiz,
  onWrong,
  onSweep
}: {
  totalQuestions: number;
  wrongCount: number;
  onStudy: () => void;
  onQuiz: () => void;
  onWrong: () => void;
  onSweep: () => void;
}) {
  return (
    <div className="py-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          网络安全与系统管理考试
        </h2>
        <p className="text-slate-400 text-lg">
          共 {totalQuestions} 道题目 · 题目 · 答案 · 解析
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
        {/* 背题模式 */}
        <button
          onClick={onStudy}
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-6 text-left shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 transition-all hover:scale-105"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">背题模式</h3>
            <p className="text-blue-100 text-sm">直接查看题目、答案和解析，适合快速记忆</p>
          </div>
        </button>

        {/* 刷题模式 */}
        <button
          onClick={onQuiz}
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 p-6 text-left shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all hover:scale-105"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">刷题模式</h3>
            <p className="text-emerald-100 text-sm">作答后给出解析，自动记录错题</p>
          </div>
        </button>

        {/* 错题本 */}
        <button
          onClick={onWrong}
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-600 to-rose-700 p-6 text-left shadow-xl shadow-rose-500/20 hover:shadow-rose-500/40 transition-all hover:scale-105"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">错题本</h3>
            <p className="text-rose-100 text-sm">
              {wrongCount > 0 ? `已收录 ${wrongCount} 道错题` : '暂无错题，继续加油！'}
            </p>
          </div>
        </button>

        {/* 错题扫除模式 */}
        <button
          onClick={onSweep}
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 to-violet-700 p-6 text-left shadow-xl shadow-purple-500/20 hover:shadow-purple-500/40 transition-all hover:scale-105"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">错题扫除</h3>
            <p className="text-purple-100 text-sm">
              {wrongCount > 0 ? `连续答对3次清除错题` : '暂无错题可扫除'}
            </p>
          </div>
        </button>
      </div>

      {/* Stats */}
      <div className="mt-12 max-w-3xl mx-auto">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            学习统计
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{totalQuestions}</div>
              <div className="text-sm text-slate-400">总题数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-rose-400">{wrongCount}</div>
              <div className="text-sm text-slate-400">错题数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400">{totalQuestions - wrongCount}</div>
              <div className="text-sm text-slate-400">已掌握</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

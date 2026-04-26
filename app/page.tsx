'use client'

import { useState } from 'react'
import MonthView from './components/MonthView'
import WeekView from './components/WeekView'
import DayView from './components/DayView'
import TodoView from './components/TodoView'

type View = 'month' | 'week' | 'day' | 'todo'

export default function Home() {
  const [currentView, setCurrentView] = useState<View>('month')
  const [currentDate, setCurrentDate] = useState(new Date())

  return (
    <main className="min-h-screen bg-white">
      {/* 상단 네비게이션 */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h1 className="text-lg font-medium text-gray-900">
          {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
        </h1>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {(['month', 'week', 'day', 'todo'] as View[]).map((view) => (
            <button
              key={view}
              onClick={() => setCurrentView(view)}
              className={`px-3 py-1.5 rounded-md text-sm transition-all ${
                currentView === view
                  ? 'bg-white text-gray-900 shadow-sm font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {view === 'month' ? '월' : view === 'week' ? '주' : view === 'day' ? '일' : '할일'}
            </button>
          ))}
        </div>
      </div>

      {/* 뷰 렌더링 */}
      <div className="p-4">
        {currentView === 'month' && <MonthView currentDate={currentDate} setCurrentDate={setCurrentDate} />}
        {currentView === 'week' && <WeekView currentDate={currentDate} setCurrentDate={setCurrentDate} />}
        {currentView === 'day' && <DayView currentDate={currentDate} setCurrentDate={setCurrentDate} />}
        {currentView === 'todo' && <TodoView />}
      </div>
    </main>
  )
}
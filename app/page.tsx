'use client'

import { useState } from 'react'
import Sidebar from './components/Sidebar'
import MonthView from './components/MonthView'
import WeekView from './components/WeekView'
import DayView from './components/DayView'
import TodoView from './components/TodoView'
import SearchModal from './components/SearchModal'
import CategoryManager from './components/CategoryManager'
import EventModal from './components/EventModal'

type View = 'month' | 'week' | 'day' | 'todo'

export default function Home() {
  const [currentView, setCurrentView] = useState<View>('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showSearch, setShowSearch] = useState(false)
  const [showCategoryManager, setShowCategoryManager] = useState(false)
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [refreshKey, setRefreshKey] = useState(0)

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  const goToToday = () => setCurrentDate(new Date())

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 사이드바 */}
      <Sidebar
        selectedCategories={selectedCategories}
        onToggleCategory={toggleCategory}
        onOpenSearch={() => setShowSearch(true)}
        onOpenCategoryManager={() => setShowCategoryManager(true)}
      />

      {/* 메인 영역 */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* 상단 헤더 */}
        <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
              className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
            >
              ‹
            </button>
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
              className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
            >
              ›
            </button>
            <h1 className="text-base font-semibold text-gray-900">
              {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
            </h1>
            <button
              onClick={goToToday}
              className="text-xs text-gray-500 border border-gray-200 px-2.5 py-1 rounded-lg hover:bg-gray-50 transition-colors"
            >
              오늘
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* 뷰 전환 */}
            <div className="flex bg-gray-100 rounded-lg p-1 gap-0.5">
              {(['month', 'week', 'day'] as View[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setCurrentView(v)}
                  className={`px-3 py-1 rounded-md text-xs transition-all ${
                    currentView === v
                      ? 'bg-white text-gray-900 shadow-sm font-medium'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {v === 'month' ? '월' : v === 'week' ? '주' : '일'}
                </button>
              ))}
            </div>

            {/* 일정 추가 버튼 */}
            <button
              onClick={() => setShowAddEvent(true)}
              className="flex items-center gap-1.5 bg-blue-500 text-white text-xs px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <span className="text-base leading-none">+</span>
              추가
            </button>
          </div>
        </header>

        {/* 할 일 탭 */}
        <div className="bg-white border-b border-gray-100 px-6 flex gap-4">
          <button
            onClick={() => setCurrentView('todo')}
            className={`text-sm py-2.5 border-b-2 transition-colors ${
              currentView === 'todo'
                ? 'border-blue-500 text-blue-500 font-medium'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            할 일
          </button>
        </div>

        {/* 뷰 영역 */}
        <main className="flex-1 p-6">
          {currentView === 'month' && (
            <MonthView
              key={refreshKey}
              currentDate={currentDate}
              setCurrentDate={setCurrentDate}
              selectedCategories={selectedCategories}
            />
          )}
          {currentView === 'week' && (
            <WeekView
              key={refreshKey}
              currentDate={currentDate}
              setCurrentDate={setCurrentDate}
              selectedCategories={selectedCategories}
            />
          )}
          {currentView === 'day' && (
            <DayView
              key={refreshKey}
              currentDate={currentDate}
              setCurrentDate={setCurrentDate}
              selectedCategories={selectedCategories}
            />
          )}
          {currentView === 'todo' && (
            <TodoView key={refreshKey} selectedCategories={selectedCategories} />
          )}
        </main>
      </div>

      {/* 모달들 */}
      {showSearch && <SearchModal onClose={() => setShowSearch(false)} />}
      {showCategoryManager && (
        <CategoryManager onClose={() => setShowCategoryManager(false)} />
      )}
      {showAddEvent && (
        <EventModal
          selectedDate={currentDate}
          onClose={() => setShowAddEvent(false)}
          onSaved={() => setRefreshKey((k) => k + 1)}
        />
      )}
    </div>
  )
}
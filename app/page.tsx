'use client'

import { useState } from 'react'
import Sidebar from './components/Sidebar'
import MonthView from './components/MonthView'
import WeekView from './components/WeekView'
import DayView from './components/DayView'
import TodoView from './components/TodoView'
import SearchModal from './components/SearchModal'
import CategoryManager from './components/CategoryManager'
import FABModal from './components/FABModal'

type View = 'month' | 'week' | 'day' | 'todo'

export default function Home() {
  const [currentView, setCurrentView] = useState<View>('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showSearch, setShowSearch] = useState(false)
  const [showCategoryManager, setShowCategoryManager] = useState(false)
  const [showFAB, setShowFAB] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [refreshKey, setRefreshKey] = useState(0)

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* 사이드바 */}
      <Sidebar
        selectedCategories={selectedCategories}
        onToggleCategory={toggleCategory}
        onOpenSearch={() => setShowSearch(true)}
        onOpenCategoryManager={() => setShowCategoryManager(true)}
        currentView={currentView}
        onChangeView={setCurrentView}
      />

      {/* 메인 영역 */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* 상단 헤더 */}
        <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
              className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
            >
              ‹
            </button>
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
              className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
            >
              ›
            </button>
            <h1 className="text-base font-semibold text-gray-900">
              {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
            </h1>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="text-xs text-gray-500 border border-gray-200 px-2.5 py-1 rounded-lg hover:bg-gray-50 transition-colors"
            >
              오늘
            </button>
          </div>

          {/* 뷰 전환 */}
          {currentView !== 'todo' && (
            <div className="flex bg-gray-100 rounded-lg p-1 gap-0.5">
              {(['month', 'week', 'day'] as View[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setCurrentView(v)}
                  className={`px-3 py-1 rounded-md text-xs transition-all ${
                    currentView === v
                      ? 'bg-white text-gray-900 shadow-sm font-medium'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  {v === 'month' ? '월' : v === 'week' ? '주' : '일'}
                </button>
              ))}
            </div>
          )}
        </header>

        {/* 뷰 영역 */}
        <main className="flex-1 p-4 overflow-hidden relative">
          <div className="h-full">
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
              <TodoView
                key={refreshKey}
                selectedCategories={selectedCategories}
              />
            )}
          </div>

          {/* FAB 버튼 */}
          <button
            onClick={() => setShowFAB(true)}
            className="fixed bottom-16 right-16 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all hover:scale-105 flex items-center justify-center text-2xl z-40"
          >
            +
          </button>
        </main>
      </div>

      {/* 모달들 */}
      {showSearch && <SearchModal onClose={() => setShowSearch(false)} />}
      {showCategoryManager && (
        <CategoryManager onClose={() => setShowCategoryManager(false)} />
      )}
      {showFAB && (
        <FABModal
          selectedDate={currentDate}
          initialDate={`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`}
          onClose={() => setShowFAB(false)}
          onSaved={() => setRefreshKey((k) => k + 1)}
        />
      )}
    </div>
  )
}
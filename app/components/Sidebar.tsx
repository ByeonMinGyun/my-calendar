'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Category } from '../lib/types'

type View = 'month' | 'week' | 'day' | 'todo'

interface Props {
  selectedCategories: string[]
  onToggleCategory: (id: string) => void
  onOpenSearch: () => void
  onOpenCategoryManager: () => void
  currentView: View
  onChangeView: (view: View) => void
}

export default function Sidebar({
  selectedCategories,
  onToggleCategory,
  onOpenSearch,
  onOpenCategoryManager,
  currentView,
  onChangeView,
}: Props) {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('created_at')
    if (data) setCategories(data)
  }

  return (
    <>
      {/* 데스크톱 사이드바 */}
      <aside className="hidden md:flex w-56 min-h-screen bg-white border-r border-gray-100 flex-col py-6 px-4 gap-1">
        {/* 로고 */}
        <div className="flex items-center gap-2 px-2 mb-6">
          <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="font-semibold text-gray-900">캘린더</span>
        </div>

        <button
          onClick={() => onChangeView('month')}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
            ['month', 'week', 'day'].includes(currentView)
              ? 'bg-blue-50 text-blue-500 font-medium'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          캘린더
        </button>

        <button
          onClick={onOpenSearch}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          검색
        </button>

        <button
          onClick={() => onChangeView('todo')}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
            currentView === 'todo'
              ? 'bg-blue-50 text-blue-500 font-medium'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          할 일
        </button>

        <button
          onClick={onOpenCategoryManager}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-5 5a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 10V5a2 2 0 012-2z" />
          </svg>
          카테고리
        </button>

        <div className="mt-4">
          <div className="px-3 mb-2">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">카테고리</span>
          </div>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onToggleCategory(cat.id)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-gray-50"
            >
              <div
                className="w-3 h-3 rounded-sm flex-shrink-0 transition-colors"
                style={{
                  backgroundColor: selectedCategories.includes(cat.id) ? cat.color : 'transparent',
                  border: `2px solid ${cat.color}`,
                }}
              />
              <span className="text-gray-900">{cat.name}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* 모바일 하단 탭바 */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-30 flex items-center justify-around px-2 py-1">
        <button
          onClick={() => onChangeView('month')}
          className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors ${
            ['month', 'week', 'day'].includes(currentView) ? 'text-blue-500' : 'text-gray-400'
          }`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-xs">캘린더</span>
        </button>

        <button
          onClick={onOpenSearch}
          className="flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-colors text-gray-400"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-xs">검색</span>
        </button>

        <button
          onClick={() => onChangeView('todo')}
          className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-colors ${
            currentView === 'todo' ? 'text-blue-500' : 'text-gray-400'
          }`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <span className="text-xs">할 일</span>
        </button>

        <button
          onClick={onOpenCategoryManager}
          className="flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-colors text-gray-400"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-5 5a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 10V5a2 2 0 012-2z" />
          </svg>
          <span className="text-xs">카테고리</span>
        </button>
      </nav>
    </>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Event, Todo } from '../lib/types'

interface Props {
  onClose: () => void
}

export default function SearchModal({ onClose }: Props) {
  const [query, setQuery] = useState('')
  const [events, setEvents] = useState<Event[]>([])
  const [todos, setTodos] = useState<Todo[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) setRecentSearches(JSON.parse(saved))
  }, [])

  useEffect(() => {
    if (query.trim()) {
      handleSearch(query.trim())
    } else {
      setEvents([])
      setTodos([])
    }
  }, [query])

  const saveRecentSearch = (q: string) => {
    const updated = [q, ...recentSearches.filter((s) => s !== q)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  const handleSearch = async (q: string) => {
    const { data: eventData } = await supabase
      .from('events')
      .select('*')
      .ilike('title', `%${q}%`)
      .order('start_at')

    const { data: todoData } = await supabase
      .from('todos')
      .select('*')
      .ilike('title', `%${q}%`)
      .order('created_at')

    if (eventData) setEvents(eventData)
    if (todoData) setTodos(todoData)
  }

  const handleQueryChange = (q: string) => {
    setQuery(q)
    if (q.trim()) saveRecentSearch(q.trim())
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem('recentSearches')
  }

  const removeRecentSearch = (s: string) => {
    const updated = recentSearches.filter((r) => r !== s)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  const toKST = (dateStr: string) =>
    new Date(new Date(dateStr).getTime() + 9 * 60 * 60 * 1000)

  const totalResults = events.length + todos.length

  return (
    <div
      className="fixed inset-0 bg-black/20 flex items-start justify-center z-50 pt-16 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* 검색 입력 */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="일정 또는 할 일을 검색하세요"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            autoFocus
            className="flex-1 text-base outline-none text-gray-900 placeholder-gray-400"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-gray-300 hover:text-gray-500 text-xl"
            >
              ×
            </button>
          )}
          <button onClick={onClose} className="text-gray-300 hover:text-gray-500 text-xl ml-1">
            ×
          </button>
        </div>

        <div className="p-5 max-h-[600px] overflow-y-auto">
          {/* 최근 검색어 */}
          {!query && recentSearches.length > 0 && (
            <div className="mb-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-500">최근 검색어</span>
                <button
                  onClick={clearRecentSearches}
                  className="text-sm text-blue-400 hover:text-blue-600"
                >
                  전체 삭제
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((s) => (
                  <div key={s} className="flex items-center gap-1 bg-gray-100 rounded-full px-4 py-1.5">
                    <button
                      onClick={() => setQuery(s)}
                      className="text-sm text-gray-600"
                    >
                      {s}
                    </button>
                    <button
                      onClick={() => removeRecentSearch(s)}
                      className="text-gray-400 hover:text-gray-600 text-sm ml-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 검색 결과 */}
          {query.trim() && (
            <>
              <div className="mb-3">
                <span className="text-sm text-gray-400">검색 결과 {totalResults}개</span>
              </div>

              {/* 일정 결과 */}
              {events.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center gap-3 py-3 border-b border-gray-50 hover:bg-gray-50 rounded-lg px-2 transition-colors cursor-pointer"
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: e.color }}
                  />
                  <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <div className="text-base text-gray-900 truncate font-medium">{e.title}</div>
                    <div className="text-sm text-gray-400 mt-0.5">
                      {e.is_multi_day
                       ? `${toKST(e.start_at).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })} — ${new Date(new Date(e.end_at).getTime() - 60000).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}`
                        : toKST(e.start_at).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
                    </div>
                  </div>
                </div>
              ))}

              {/* 할일 결과 */}
              {todos.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-3 py-3 border-b border-gray-50 hover:bg-gray-50 rounded-lg px-2 transition-colors cursor-pointer"
                >
                  <div
                    className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center ${
                      t.is_done ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                    }`}
                  >
                    {t.is_done && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <div className={`text-base truncate font-medium ${t.is_done ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                      {t.title}
                    </div>
                    {t.due_date && (
                      <div className="text-sm text-gray-400 mt-0.5">
                        {new Date(t.due_date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {totalResults === 0 && (
                <p className="text-center text-base text-gray-300 py-12">검색 결과가 없어요</p>
              )}

              {query && totalResults > 0 && (
                <button
                  onClick={() => setQuery('')}
                  className="w-full py-3 border border-gray-200 text-sm text-gray-500 rounded-xl hover:bg-gray-50 transition-colors mt-4"
                >
                  검색 초기화
                </button>
              )}
            </>
          )}

          {/* 검색어 없을 때 빈 상태 */}
          {!query && recentSearches.length === 0 && (
            <p className="text-center text-base text-gray-300 py-12">검색어를 입력해 주세요</p>
          )}
        </div>
      </div>
    </div>
  )
}
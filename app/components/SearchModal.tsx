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
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) setRecentSearches(JSON.parse(saved))
  }, [])

  const saveRecentSearch = (q: string) => {
    const updated = [q, ...recentSearches.filter((s) => s !== q)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  const handleSearch = async () => {
    if (!query.trim()) return
    saveRecentSearch(query.trim())
    setSearched(true)

    const { data: eventData } = await supabase
      .from('events')
      .select('*')
      .ilike('title', `%${query}%`)
      .order('start_at')

    const { data: todoData } = await supabase
      .from('todos')
      .select('*')
      .ilike('title', `%${query}%`)
      .order('created_at')

    if (eventData) setEvents(eventData)
    if (todoData) setTodos(todoData)
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

  return (
    <div
      className="fixed inset-0 bg-black/20 flex items-start justify-center z-50 pt-20 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 검색 입력 */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="일정 또는 할 일을 검색하세요"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            autoFocus
            className="flex-1 text-sm outline-none text-gray-900 placeholder-gray-400"
          />
          {query && (
            <button onClick={() => { setQuery(''); setSearched(false) }} className="text-gray-300 hover:text-gray-500">
              ×
            </button>
          )}
          <button onClick={onClose} className="text-gray-300 hover:text-gray-500 text-xl ml-1">
            ×
          </button>
        </div>

        <div className="p-4 max-h-96 overflow-y-auto">
          {!searched ? (
            <>
              {/* 최근 검색어 */}
              {recentSearches.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-500">최근 검색어</span>
                    <button onClick={clearRecentSearches} className="text-xs text-gray-400 hover:text-gray-600">
                      전체 삭제
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((s) => (
                      <div key={s} className="flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1">
                        <button
                          onClick={() => { setQuery(s); handleSearch() }}
                          className="text-xs text-gray-600"
                        >
                          {s}
                        </button>
                        <button onClick={() => removeRecentSearch(s)} className="text-gray-400 hover:text-gray-600 text-xs">
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 검색 버튼 */}
              <button
                onClick={handleSearch}
                className="w-full py-2.5 bg-blue-500 text-white text-sm rounded-xl hover:bg-blue-600 transition-colors"
              >
                검색
              </button>
            </>
          ) : (
            <>
              {/* 검색 결과 */}
              <div className="mb-2">
                <span className="text-xs text-gray-400">
                  검색 결과 {events.length + todos.length}개
                </span>
              </div>

              {events.map((e) => (
                <div key={e.id} className="flex items-center gap-3 py-2.5 border-b border-gray-50">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: e.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-900 truncate">{e.title}</div>
                    <div className="text-xs text-gray-400">
                      {new Date(e.start_at).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
                      {' '}
                      {new Date(e.start_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                      {' - '}
                      {new Date(e.end_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}

              {todos.map((t) => (
                <div key={t.id} className="flex items-center gap-3 py-2.5 border-b border-gray-50">
                  <div className="w-4 h-4 rounded border-2 border-gray-300 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm truncate ${t.is_done ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                      {t.title}
                    </div>
                    {t.due_date && (
                      <div className="text-xs text-gray-400">
                        {new Date(t.due_date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {events.length === 0 && todos.length === 0 && (
                <p className="text-center text-sm text-gray-400 py-8">검색 결과가 없어요</p>
              )}

              <button
                onClick={() => { setSearched(false); setQuery('') }}
                className="w-full py-2.5 border border-gray-200 text-sm text-gray-500 rounded-xl hover:bg-gray-50 transition-colors mt-3"
              >
                검색 초기화
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
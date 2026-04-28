'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { Event, Todo } from '../lib/types'
import EventDetailModal from './EventDetailModal'
import FABModal from './FABModal'

interface Props {
  date: Date
  onClose: () => void
  onSaved: () => void
}

export default function DayDetailModal({ date, onClose, onSaved }: Props) {
  const [events, setEvents] = useState<Event[]>([])
  const [todos, setTodos] = useState<Todo[]>([])
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null)
  const [showFAB, setShowFAB] = useState(false)
  const [draggingIndex, setDraggingIndex] = useState<{ type: 'event' | 'todo', index: number } | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<{ type: 'event' | 'todo', index: number } | null>(null)
  const [longPressIndex, setLongPressIndex] = useState<{ type: 'event' | 'todo', index: number } | null>(null)
  const touchStartY = useRef<number | null>(null)
  const touchItem = useRef<{ type: 'event' | 'todo', index: number } | null>(null)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

  const fetchEvents = async () => {
    const { data } = await supabase.from('events').select('*')
    if (data) {
      const filtered = data.filter((e) => {
        const startDate = new Date(e.start_at)
        const endDate = new Date(e.end_at)
        const targetDate = new Date(dateStr)
        const startDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
        const endDay = e.is_multi_day
          ? new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
          : startDay
        const target = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate())
        return target >= startDay && target <= endDay
      })
      setEvents(filtered.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)))
    }
  }

  const fetchTodos = async () => {
    const { data } = await supabase
      .from('todos')
      .select('*')
      .eq('due_date', dateStr)
      .order('sort_order')
    if (data) setTodos(data)
  }

  const fetchAll = () => {
    fetchEvents()
    fetchTodos()
  }

  useEffect(() => {
    fetchAll()
  }, [dateStr])

  const toggleTodo = async (id: string, is_done: boolean) => {
    await supabase.from('todos').update({ is_done: !is_done }).eq('id', id)
    fetchTodos()
  }

  const handleDragStart = (type: 'event' | 'todo', index: number) => {
    setDraggingIndex({ type, index })
  }

  const handleDragEnter = (type: 'event' | 'todo', index: number) => {
    setDragOverIndex({ type, index })
  }

  const handleDragEnd = async () => {
    if (!draggingIndex || !dragOverIndex) {
      setDraggingIndex(null)
      setDragOverIndex(null)
      return
    }
    if (draggingIndex.type !== dragOverIndex.type || draggingIndex.index === dragOverIndex.index) {
      setDraggingIndex(null)
      setDragOverIndex(null)
      return
    }
    await reorder(draggingIndex.type, draggingIndex.index, dragOverIndex.index)
    setDraggingIndex(null)
    setDragOverIndex(null)
  }

  const handleTouchStart = (type: 'event' | 'todo', index: number, e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
    longPressTimer.current = setTimeout(() => {
      touchItem.current = { type, index }
      setLongPressIndex({ type, index })
    }, 400)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
    if (!touchItem.current) return
    e.preventDefault()
    const touchY = e.touches[0].clientY
    const elements = document.querySelectorAll(`[data-type="${touchItem.current.type}"]`)
    elements.forEach((el, i) => {
      const rect = el.getBoundingClientRect()
      if (touchY >= rect.top && touchY <= rect.bottom) {
        setDragOverIndex({ type: touchItem.current!.type, index: i })
      }
    })
  }

  const handleTouchEnd = async () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
    if (!touchItem.current || !dragOverIndex) {
      touchItem.current = null
      touchStartY.current = null
      setDragOverIndex(null)
      setLongPressIndex(null)
      return
    }
    if (touchItem.current.index !== dragOverIndex.index) {
      await reorder(touchItem.current.type, touchItem.current.index, dragOverIndex.index)
    }
    touchItem.current = null
    touchStartY.current = null
    setDragOverIndex(null)
    setLongPressIndex(null)
  }

  const reorder = async (type: 'event' | 'todo', fromIndex: number, toIndex: number) => {
    if (type === 'event') {
      const newEvents = [...events]
      const draggedItem = newEvents.splice(fromIndex, 1)[0]
      newEvents.splice(toIndex, 0, draggedItem)
      setEvents(newEvents)
      await Promise.all(
        newEvents.map((e, i) =>
          supabase.from('events').update({ sort_order: i }).eq('id', e.id)
        )
      )
    } else {
      const newTodos = [...todos]
      const draggedItem = newTodos.splice(fromIndex, 1)[0]
      newTodos.splice(toIndex, 0, draggedItem)
      setTodos(newTodos)
      await Promise.all(
        newTodos.map((t, i) =>
          supabase.from('todos').update({ sort_order: i }).eq('id', t.id)
        )
      )
    }
  }

  const dayNames = ['일', '월', '화', '수', '목', '금', '토']

  if (selectedEvent) {
    return (
      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onSaved={() => { fetchAll(); onSaved() }}
      />
    )
  }

  if (selectedTodo) {
    return (
      <FABModal
        selectedDate={date}
        existingTodo={selectedTodo}
        onClose={() => setSelectedTodo(null)}
        onSaved={() => { fetchAll(); onSaved() }}
      />
    )
  }

  if (showFAB) {
    return (
      <FABModal
        selectedDate={date}
        initialDate={dateStr}
        onClose={() => setShowFAB(false)}
        onSaved={() => { fetchAll(); onSaved() }}
      />
    )
  }

  return (
    <div
      className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {date.getMonth() + 1}월 {date.getDate()}일
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">{dayNames[date.getDay()]}요일</p>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-500 text-2xl">×</button>
        </div>

        {/* 내용 */}
        <div className="p-6 max-h-[500px] overflow-y-auto">
          {events.length === 0 && todos.length === 0 && (
            <p className="text-center text-base text-gray-300 py-12">일정이 없어요</p>
          )}

          {/* 일정 목록 */}
          {events.length > 0 && (
            <div className="mb-5">
              <p className="text-sm font-medium text-gray-400 mb-3">
                일정 <span className="text-xs text-gray-300 ml-1">길게 눌러서 순서 변경</span>
              </p>
              {events.map((e, i) => (
                <div
                  key={e.id}
                  data-type="event"
                  draggable
                  onDragStart={() => handleDragStart('event', i)}
                  onDragEnter={() => handleDragEnter('event', i)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(evt) => evt.preventDefault()}
                  onTouchStart={(evt) => handleTouchStart('event', i, evt)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all mb-1.5 cursor-grab active:cursor-grabbing select-none ${
                    draggingIndex?.type === 'event' && draggingIndex.index === i
                      ? 'opacity-40'
                      : longPressIndex?.type === 'event' && longPressIndex.index === i
                      ? 'border-2 border-blue-400 bg-blue-50'
                      : dragOverIndex?.type === 'event' && dragOverIndex.index === i
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                  style={{ WebkitUserSelect: 'none', userSelect: 'none' }}
                >
                  <div className="text-gray-300 flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                    </svg>
                  </div>
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: e.color }}
                  />
                  <span
                    className="text-base text-gray-800 font-medium flex-1"
                    onClick={() => setSelectedEvent(e)}
                  >
                    {e.title}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* 할일 목록 */}
          {todos.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-400 mb-3">
                할 일 <span className="text-xs text-gray-300 ml-1">길게 눌러서 순서 변경</span>
              </p>
              {todos.map((t, i) => (
                <div
                  key={t.id}
                  data-type="todo"
                  draggable
                  onDragStart={() => handleDragStart('todo', i)}
                  onDragEnter={() => handleDragEnter('todo', i)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(evt) => evt.preventDefault()}
                  onTouchStart={(evt) => handleTouchStart('todo', i, evt)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all mb-1.5 cursor-grab active:cursor-grabbing select-none ${
                    draggingIndex?.type === 'todo' && draggingIndex.index === i
                      ? 'opacity-40'
                      : longPressIndex?.type === 'todo' && longPressIndex.index === i
                      ? 'border-2 border-blue-400 bg-blue-50'
                      : dragOverIndex?.type === 'todo' && dragOverIndex.index === i
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                  style={{ WebkitUserSelect: 'none', userSelect: 'none' }}
                >
                  <div className="text-gray-300 flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                    </svg>
                  </div>
                  <div
                    onClick={() => toggleTodo(t.id, t.is_done)}
                    className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center cursor-pointer transition-colors ${
                      t.is_done ? 'bg-blue-500 border-blue-500' : 'border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    {t.is_done && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span
                    onClick={() => setSelectedTodo(t)}
                    className={`text-base cursor-pointer flex-1 ${
                      t.is_done ? 'line-through text-gray-300' : 'text-gray-800 hover:text-blue-500'
                    }`}
                  >
                    {t.title}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 하단 FAB */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={() => setShowFAB(true)}
            className="w-12 h-12 bg-blue-500 text-white rounded-full shadow hover:bg-blue-600 transition-all hover:scale-105 flex items-center justify-center text-2xl"
          >
            +
          </button>
        </div>
      </div>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
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

  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

  const fetchEvents = async () => {
    const start = new Date(dateStr + 'T00:00:00').toISOString()
    const end = new Date(dateStr + 'T23:59:59').toISOString()
    const { data } = await supabase
      .from('events')
      .select('*')
      .lte('start_at', end)
      .gte('end_at', start)
    if (data) setEvents(data)
  }

  const fetchTodos = async () => {
    const { data } = await supabase
      .from('todos')
      .select('*')
      .eq('due_date', dateStr)
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
        initialDate={`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`}
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
              <p className="text-sm font-medium text-gray-400 mb-3">일정</p>
              {events.map((e) => (
                <div
                  key={e.id}
                  onClick={() => setSelectedEvent(e)}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors mb-1.5"
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: e.color }}
                  />
                  <span className="text-base text-gray-800 font-medium">{e.title}</span>
                </div>
              ))}
            </div>
          )}

          {/* 할일 목록 */}
          {todos.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-400 mb-3">할 일</p>
              {todos.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-gray-50 transition-colors mb-1.5"
                >
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
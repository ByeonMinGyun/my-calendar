'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import EventModal from './EventModal'

interface Event {
  id: string
  title: string
  description: string
  start_at: string
  end_at: string
  color: string
}

interface Props {
  currentDate: Date
  setCurrentDate: (date: Date) => void
}

export default function MonthView({ currentDate, setCurrentDate }: Props) {
  const [events, setEvents] = useState<Event[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const blanks = Array.from({ length: firstDay }, (_, i) => i)

  const fetchEvents = async () => {
    const start = new Date(year, month, 1).toISOString()
    const end = new Date(year, month + 1, 0).toISOString()
    const { data } = await supabase
      .from('events')
      .select('*')
      .gte('start_at', start)
      .lte('start_at', end)
    if (data) setEvents(data)
  }

  useEffect(() => {
    fetchEvents()
  }, [year, month])

  const getEventsForDay = (day: number) => {
    return events.filter((e) => {
      const d = new Date(e.start_at)
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day
    })
  }

  const today = new Date()
  const isToday = (day: number) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === day

  return (
    <div>
      {/* 이전/다음 월 이동 */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
        >
          ←
        </button>
        <span className="text-sm font-medium text-gray-700">
          {year}년 {month + 1}월
        </span>
        <button
          onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
        >
          →
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 mb-2">
        {['일', '월', '화', '수', '목', '금', '토'].map((d) => (
          <div key={d} className="text-center text-xs text-gray-400 py-2">
            {d}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-1">
        {blanks.map((i) => (
          <div key={`blank-${i}`} />
        ))}
        {days.map((day) => (
          <div
            key={day}
            onClick={() => setSelectedDate(new Date(year, month, day))}
            className="min-h-16 p-1 rounded-lg hover:bg-gray-50 cursor-pointer"
          >
            <div
              className={`text-xs w-6 h-6 flex items-center justify-center rounded-full mb-1 ${
                isToday(day)
                  ? 'bg-gray-900 text-white font-medium'
                  : 'text-gray-700'
              }`}
            >
              {day}
            </div>
            {getEventsForDay(day).map((e) => (
              <div
                key={e.id}
                onClick={(evt) => {
                  evt.stopPropagation()
                  setSelectedEvent(e)
                }}
                className="text-xs px-1 py-0.5 rounded mb-0.5 truncate text-white cursor-pointer hover:opacity-80"
                style={{ backgroundColor: e.color }}
              >
                {e.title}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* 날짜 클릭 → 새 일정 추가 */}
      {selectedDate && !selectedEvent && (
        <EventModal
          selectedDate={selectedDate}
          onClose={() => setSelectedDate(null)}
          onSaved={fetchEvents}
        />
      )}

      {/* 일정 클릭 → 수정/삭제 */}
      {selectedEvent && (
        <EventModal
          selectedDate={new Date(selectedEvent.start_at)}
          existingEvent={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onSaved={fetchEvents}
        />
      )}
    </div>
  )
}
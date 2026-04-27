'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Event } from '../lib/types'
import EventModal from './EventModal'

interface Props {
  currentDate: Date
  setCurrentDate: (date: Date) => void
  selectedCategories: string[]
}

export default function MonthView({ currentDate, setCurrentDate, selectedCategories }: Props) {
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
    const end = new Date(year, month + 1, 0, 23, 59, 59).toISOString()
    let query = supabase
      .from('events')
      .select('*')
      .gte('start_at', start)
      .lte('start_at', end)

    if (selectedCategories.length > 0) {
      query = query.in('category_id', selectedCategories)
    }

    const { data } = await query
    if (data) setEvents(data)
  }

  useEffect(() => {
    fetchEvents()
  }, [year, month, selectedCategories])

  const getEventsForDay = (day: number) =>
    events.filter((e) => {
      const d = new Date(e.start_at)
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day
    })

  const today = new Date()
  const isToday = (day: number) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === day

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 border-b border-gray-100">
        {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
          <div
            key={d}
            className={`text-center text-xs py-3 font-medium ${
              i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'
            }`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7">
        {blanks.map((i) => (
          <div key={`blank-${i}`} className="border-b border-r border-gray-50 min-h-24" />
        ))}
        {days.map((day, idx) => {
          const dayEvents = getEventsForDay(day)
          const col = (firstDay + idx) % 7
          return (
            <div
              key={day}
              onClick={() => setSelectedDate(new Date(year, month, day))}
              className={`min-h-24 p-1.5 border-b border-r border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${
                col === 0 ? 'bg-red-50/30' : col === 6 ? 'bg-blue-50/30' : ''
              }`}
            >
              <div
                className={`text-xs w-6 h-6 flex items-center justify-center rounded-full mb-1 font-medium ${
                  isToday(day)
                    ? 'bg-blue-500 text-white'
                    : col === 0
                    ? 'text-red-400'
                    : col === 6
                    ? 'text-blue-400'
                    : 'text-gray-700'
                }`}
              >
                {day}
              </div>
              {dayEvents.slice(0, 3).map((e) => (
                <div
                  key={e.id}
                  onClick={(evt) => { evt.stopPropagation(); setSelectedEvent(e) }}
                  className="text-xs px-1.5 py-0.5 rounded mb-0.5 truncate text-white cursor-pointer hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: e.color }}
                >
                  {e.title}
                </div>
              ))}
              {dayEvents.length > 3 && (
                <div className="text-xs text-gray-400 px-1">+{dayEvents.length - 3}개</div>
              )}
            </div>
          )
        })}
      </div>

      {selectedDate && !selectedEvent && (
        <EventModal
          selectedDate={selectedDate}
          onClose={() => setSelectedDate(null)}
          onSaved={fetchEvents}
        />
      )}
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
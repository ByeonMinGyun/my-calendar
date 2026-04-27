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

export default function WeekView({ currentDate, setCurrentDate, selectedCategories }: Props) {
  const [events, setEvents] = useState<Event[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  const getWeekDays = (date: Date) => {
    const day = date.getDay()
    const start = new Date(date)
    start.setDate(date.getDate() - day)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      return d
    })
  }

  const weekDays = getWeekDays(currentDate)
  const today = new Date()

  const fetchEvents = async () => {
    const start = weekDays[0].toISOString()
    const end = weekDays[6].toISOString()
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
  }, [currentDate, selectedCategories])

  const getEventsForDay = (date: Date) =>
    events.filter((e) => {
      const d = new Date(e.start_at)
      return (
        d.getFullYear() === date.getFullYear() &&
        d.getMonth() === date.getMonth() &&
        d.getDate() === date.getDate()
      )
    })

  const isToday = (date: Date) =>
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()

  const dayNames = ['일', '월', '화', '수', '목', '금', '토']

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* 이전/다음 주 이동 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <button
          onClick={() => {
            const d = new Date(currentDate)
            d.setDate(d.getDate() - 7)
            setCurrentDate(d)
          }}
          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
        >
          ‹
        </button>
        <span className="text-sm font-medium text-gray-700">
          {weekDays[0].getMonth() + 1}월 {weekDays[0].getDate()}일 —{' '}
          {weekDays[6].getMonth() + 1}월 {weekDays[6].getDate()}일
        </span>
        <button
          onClick={() => {
            const d = new Date(currentDate)
            d.setDate(d.getDate() + 7)
            setCurrentDate(d)
          }}
          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
        >
          ›
        </button>
      </div>

      {/* 주간 그리드 */}
      <div className="grid grid-cols-7 divide-x divide-gray-50">
        {weekDays.map((date, i) => (
          <div key={i} className="flex flex-col">
            <div className="flex flex-col items-center py-3 border-b border-gray-100">
              <div className={`text-xs mb-1 font-medium ${
                i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'
              }`}>
                {dayNames[i]}
              </div>
              <div
                onClick={() => setSelectedDate(date)}
                className={`w-8 h-8 flex items-center justify-center rounded-full text-sm cursor-pointer transition-colors ${
                  isToday(date)
                    ? 'bg-blue-500 text-white font-medium'
                    : i === 0
                    ? 'text-red-400 hover:bg-red-50'
                    : i === 6
                    ? 'text-blue-400 hover:bg-blue-50'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {date.getDate()}
              </div>
            </div>
            <div className="flex flex-col gap-1 p-1 min-h-32">
              {getEventsForDay(date).map((e) => (
                <div
                  key={e.id}
                  onClick={() => setSelectedEvent(e)}
                  className="text-xs px-1.5 py-1 rounded truncate text-white cursor-pointer hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: e.color }}
                >
                  {e.title}
                </div>
              ))}
            </div>
          </div>
        ))}
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
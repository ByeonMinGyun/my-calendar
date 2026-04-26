'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import EventModal from './EventModal'

interface Event {
  id: string
  title: string
  start_at: string
  end_at: string
  color: string
}

interface Props {
  currentDate: Date
  setCurrentDate: (date: Date) => void
}

export default function WeekView({ currentDate, setCurrentDate }: Props) {
  const [events, setEvents] = useState<Event[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

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
    const { data } = await supabase
      .from('events')
      .select('*')
      .gte('start_at', start)
      .lte('start_at', end)
    if (data) setEvents(data)
  }

  useEffect(() => {
    fetchEvents()
  }, [currentDate])

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
    <div>
      {/* 이전/다음 주 이동 */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => {
            const d = new Date(currentDate)
            d.setDate(d.getDate() - 7)
            setCurrentDate(d)
          }}
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
        >
          ←
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
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
        >
          →
        </button>
      </div>

      {/* 주간 그리드 */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((date, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="text-xs text-gray-400 mb-1">{dayNames[i]}</div>
            <div
              onClick={() => setSelectedDate(date)}
              className={`w-8 h-8 flex items-center justify-center rounded-full text-sm cursor-pointer mb-2 ${
                isToday(date)
                  ? 'bg-gray-900 text-white font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {date.getDate()}
            </div>
            <div className="w-full flex flex-col gap-1">
              {getEventsForDay(date).map((e) => (
                <div
                  key={e.id}
                  className="text-xs px-1 py-0.5 rounded truncate text-white cursor-pointer"
                  style={{ backgroundColor: e.color }}
                >
                  {e.title}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedDate && (
        <EventModal
          selectedDate={selectedDate}
          onClose={() => setSelectedDate(null)}
          onSaved={fetchEvents}
        />
      )}
    </div>
  )
}
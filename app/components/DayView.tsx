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

export default function DayView({ currentDate, setCurrentDate }: Props) {
  const [events, setEvents] = useState<Event[]>([])
  const [showModal, setShowModal] = useState(false)

  const hours = Array.from({ length: 24 }, (_, i) => i)

  const fetchEvents = async () => {
    const start = new Date(currentDate)
    start.setHours(0, 0, 0, 0)
    const end = new Date(currentDate)
    end.setHours(23, 59, 59, 999)
    const { data } = await supabase
      .from('events')
      .select('*')
      .gte('start_at', start.toISOString())
      .lte('start_at', end.toISOString())
    if (data) setEvents(data)
  }

  useEffect(() => {
    fetchEvents()
  }, [currentDate])

  const getEventsForHour = (hour: number) =>
    events.filter((e) => new Date(e.start_at).getHours() === hour)

  return (
    <div>
      {/* 이전/다음 일 이동 */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => {
            const d = new Date(currentDate)
            d.setDate(d.getDate() - 1)
            setCurrentDate(d)
          }}
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
        >
          ←
        </button>
        <span className="text-sm font-medium text-gray-700">
          {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월{' '}
          {currentDate.getDate()}일
        </span>
        <button
          onClick={() => {
            const d = new Date(currentDate)
            d.setDate(d.getDate() + 1)
            setCurrentDate(d)
          }}
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
        >
          →
        </button>
      </div>

      {/* 일정 추가 버튼 */}
      <button
        onClick={() => setShowModal(true)}
        className="mb-4 w-full py-2 rounded-lg border border-dashed border-gray-200 text-sm text-gray-400 hover:border-gray-300 hover:text-gray-500 transition-colors"
      >
        + 일정 추가
      </button>

      {/* 시간별 그리드 */}
      <div className="flex flex-col">
        {hours.map((hour) => (
          <div key={hour} className="flex gap-3 min-h-12 border-t border-gray-50">
            <div className="text-xs text-gray-300 w-10 pt-1 text-right">
              {hour === 0 ? '' : `${hour}:00`}
            </div>
            <div className="flex-1 py-1">
              {getEventsForHour(hour).map((e) => (
                <div
                  key={e.id}
                  className="text-xs px-2 py-1 rounded mb-1 text-white"
                  style={{ backgroundColor: e.color }}
                >
                  <div className="font-medium">{e.title}</div>
                  {e.description && (
                    <div className="opacity-80">{e.description}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <EventModal
          selectedDate={currentDate}
          onClose={() => setShowModal(false)}
          onSaved={fetchEvents}
        />
      )}
    </div>
  )
}
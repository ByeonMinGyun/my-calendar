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

export default function DayView({ currentDate, setCurrentDate, selectedCategories }: Props) {
  const [events, setEvents] = useState<Event[]>([])
  const [showModal, setShowModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  const hours = Array.from({ length: 24 }, (_, i) => i)

  const fetchEvents = async () => {
    const start = new Date(currentDate)
    start.setHours(0, 0, 0, 0)
    const end = new Date(currentDate)
    end.setHours(23, 59, 59, 999)

    let query = supabase
      .from('events')
      .select('*')
      .gte('start_at', start.toISOString())
      .lte('start_at', end.toISOString())

    if (selectedCategories.length > 0) {
      query = query.in('category_id', selectedCategories)
    }

    const { data } = await query
    if (data) setEvents(data)
  }

  useEffect(() => {
    fetchEvents()
  }, [currentDate, selectedCategories])

  const getEventsForHour = (hour: number) =>
    events.filter((e) => new Date(e.start_at).getHours() === hour)

  const today = new Date()
  const isToday =
    currentDate.getFullYear() === today.getFullYear() &&
    currentDate.getMonth() === today.getMonth() &&
    currentDate.getDate() === today.getDate()

  const dayNames = ['일', '월', '화', '수', '목', '금', '토']

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <button
          onClick={() => {
            const d = new Date(currentDate)
            d.setDate(d.getDate() - 1)
            setCurrentDate(d)
          }}
          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
        >
          ‹
        </button>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${isToday ? 'text-blue-500' : 'text-gray-700'}`}>
            {currentDate.getMonth() + 1}월 {currentDate.getDate()}일
          </span>
          <span className="text-xs text-gray-400">
            {dayNames[currentDate.getDay()]}요일
          </span>
        </div>
        <button
          onClick={() => {
            const d = new Date(currentDate)
            d.setDate(d.getDate() + 1)
            setCurrentDate(d)
          }}
          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
        >
          ›
        </button>
      </div>

      {/* 일정 추가 버튼 */}
      <div className="px-4 py-2 border-b border-gray-50">
        <button
          onClick={() => setShowModal(true)}
          className="w-full py-2 rounded-lg border border-dashed border-gray-200 text-xs text-gray-400 hover:border-blue-300 hover:text-blue-400 transition-colors"
        >
          + 일정 추가
        </button>
      </div>

      {/* 시간별 그리드 */}
      <div className="flex flex-col overflow-y-auto max-h-[600px]">
        {hours.map((hour) => (
          <div key={hour} className="flex gap-3 min-h-14 border-t border-gray-50">
            <div className="text-xs text-gray-300 w-14 pt-2 text-right pr-3 flex-shrink-0">
              {hour === 0 ? '' : `${String(hour).padStart(2, '0')}:00`}
            </div>
            <div className="flex-1 py-1 pr-4">
              {getEventsForHour(hour).map((e) => (
                <div
                  key={e.id}
                  onClick={() => setSelectedEvent(e)}
                  className="text-xs px-2 py-1.5 rounded-lg mb-1 text-white cursor-pointer hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: e.color }}
                >
                  <div className="font-medium">{e.title}</div>
                  <div className="opacity-80 mt-0.5">
                    {new Date(e.start_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                    {' - '}
                    {new Date(e.end_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  {e.description && (
                    <div className="opacity-70 mt-0.5">{e.description}</div>
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
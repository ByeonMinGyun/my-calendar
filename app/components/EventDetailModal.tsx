'use client'

import { Event } from '../lib/types'
import EventModal from './EventModal'
import { useState } from 'react'
import { supabase } from '../lib/supabase'

interface Props {
  event: Event
  onClose: () => void
  onSaved: () => void
}

export default function EventDetailModal({ event, onClose, onSaved }: Props) {
  const [showEdit, setShowEdit] = useState(false)

  const handleDelete = async () => {
    await supabase.from('events').delete().eq('id', event.id)
    onSaved()
    onClose()
  }

  if (showEdit) {
    return (
      <EventModal
        selectedDate={new Date(event.start_at)}
        existingEvent={event}
        onClose={() => setShowEdit(false)}
        onSaved={() => { onSaved(); onClose() }}
      />
    )
  }

  return (
    <div
      className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: event.color }}
            />
            <h2 className="text-lg font-semibold text-gray-900">{event.title}</h2>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-500 text-2xl">×</button>
        </div>

        {/* 내용 */}
        <div className="px-6 py-5 flex flex-col gap-4">
          {/* 날짜 */}
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-base text-gray-700">
              {event.is_multi_day
                ? `${new Date(event.start_at).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })} — ${new Date(new Date(event.end_at).getTime() - 60000).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}`
                : new Date(event.start_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })
              }
            </span>
          </div>

          {/* 메모 */}
          {event.description && (
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              <p className="text-base text-gray-700 whitespace-pre-wrap">{event.description}</p>
            </div>
          )}
        </div>

        {/* 하단 버튼 */}
        <div className="flex gap-2 px-6 py-4 border-t border-gray-100">
          <button
            onClick={() => setShowEdit(true)}
            className="flex-1 py-3 bg-blue-500 text-white text-base rounded-xl hover:bg-blue-600 transition-colors font-medium"
          >
            수정
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 py-3 text-red-400 text-base rounded-xl hover:bg-red-50 transition-colors border border-red-100"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  )
}
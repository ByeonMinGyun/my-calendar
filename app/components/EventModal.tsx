'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Event, Category } from '../lib/types'

interface Props {
  selectedDate: Date
  onClose: () => void
  onSaved: () => void
  existingEvent?: Event
}

export default function EventModal({ selectedDate, onClose, onSaved, existingEvent }: Props) {
  const [title, setTitle] = useState(existingEvent?.title || '')
  const [description, setDescription] = useState(existingEvent?.description || '')
  const [startTime, setStartTime] = useState(
    existingEvent ? new Date(existingEvent.start_at).toTimeString().slice(0, 5) : '09:00'
  )
  const [endTime, setEndTime] = useState(
    existingEvent ? new Date(existingEvent.end_at).toTimeString().slice(0, 5) : '10:00'
  )
  const [color, setColor] = useState(existingEvent?.color || '#3b82f6')
  const [categoryId, setCategoryId] = useState(existingEvent?.category_id || '')
  const [categories, setCategories] = useState<Category[]>([])

  const colors = [
    '#3b82f6', '#ef4444', '#10b981',
    '#f59e0b', '#8b5cf6', '#ec4899',
  ]

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('created_at')
    if (data) setCategories(data)
  }

  const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`

  const handleSave = async () => {
    if (!title.trim()) return
    const payload = {
      title: title.trim(),
      description: description.trim(),
      start_at: `${dateStr}T${startTime}:00`,
      end_at: `${dateStr}T${endTime}:00`,
      color,
      category_id: categoryId || null,
    }
    if (existingEvent) {
      await supabase.from('events').update(payload).eq('id', existingEvent.id)
    } else {
      await supabase.from('events').insert(payload)
    }
    onSaved()
    onClose()
  }

  const handleDelete = async () => {
    if (!existingEvent) return
    await supabase.from('events').delete().eq('id', existingEvent.id)
    onSaved()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-medium text-gray-900">
            {existingEvent ? '일정 수정' : `${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일`}
          </h2>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-500 text-xl">
            ×
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="일정 제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-300 transition-colors"
          />
          <input
            type="text"
            placeholder="메모 (선택)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-300 transition-colors"
          />
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-gray-400 mb-1 block">시작</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-300"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-400 mb-1 block">종료</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-300"
              />
            </div>
          </div>

          {/* 카테고리 선택 */}
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-300 transition-colors text-gray-500"
          >
            <option value="">카테고리 선택 (선택)</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          {/* 색상 선택 */}
          <div className="flex gap-2 pt-1">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className="w-7 h-7 rounded-full transition-transform hover:scale-110"
                style={{
                  backgroundColor: c,
                  outline: color === c ? `2px solid ${c}` : 'none',
                  outlineOffset: '2px',
                }}
              />
            ))}
          </div>

          <button
            onClick={handleSave}
            className="w-full py-2.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors mt-1"
          >
            {existingEvent ? '수정 완료' : '저장'}
          </button>

          {existingEvent && (
            <button
              onClick={handleDelete}
              className="w-full py-2.5 text-red-400 text-sm rounded-lg hover:bg-red-50 transition-colors"
            >
              일정 삭제
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
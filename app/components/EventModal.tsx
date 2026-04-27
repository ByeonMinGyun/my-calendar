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
  const [eventDate, setEventDate] = useState(
    existingEvent
      ? (() => {
          const d = new Date(existingEvent.start_at)
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        })()
      : `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
  )
  const [categoryId, setCategoryId] = useState(existingEvent?.category_id || '')
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('created_at')
    if (data) setCategories(data)
  }

  const getCategoryColor = (id: string) => {
    const cat = categories.find((c) => c.id === id)
    return cat?.color || '#3b82f6'
  }

  const handleSave = async () => {
    if (!title.trim()) return
    const payload = {
      title: title.trim(),
      description: description.trim(),
      start_at: `${eventDate}T00:00:00`,
      end_at: `${eventDate}T23:59:00`,
      color: getCategoryColor(categoryId),
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
          <textarea
            placeholder="메모 (선택)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-300 transition-colors resize-none"
          />

          {/* 날짜 선택 */}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">날짜</label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-300 cursor-pointer"
              onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
            />
          </div>

          {/* 카테고리 선택 */}

          {/* 카테고리 선택 */}
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-300 transition-colors text-gray-500"
          >
            <option value="">카테고리 선택</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

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
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Category } from '../lib/types'

interface Props {
  startDate: Date
  endDate: Date
  onClose: () => void
  onSaved: () => void
}

export default function MultiDayEventModal({ startDate, endDate, onClose, onSaved }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
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

  const formatDate = (d: Date) =>
    `${d.getMonth() + 1}월 ${d.getDate()}일`

  const toDateStr = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

  const handleSave = async () => {
    if (!title.trim()) return
    await supabase.from('events').insert({
      title: title.trim(),
      description: description.trim(),
      start_at: `${toDateStr(startDate)}T12:00:00+09:00`,
      end_at: `${toDateStr(endDate)}T12:00:00+09:00`,
      color: getCategoryColor(categoryId),
      category_id: categoryId || null,
      is_multi_day: true,
    })
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
          <div>
            <h2 className="text-base font-medium text-gray-900">일정 추가</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {formatDate(startDate)} — {formatDate(endDate)}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-500 text-xl">×</button>
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
            저장
          </button>
        </div>
      </div>
    </div>
  )
}
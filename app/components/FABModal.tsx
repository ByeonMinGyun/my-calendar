'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Category, Todo } from '../lib/types'

type TabType = 'event' | 'todo'

interface Props {
  selectedDate: Date
  onClose: () => void
  onSaved: () => void
  existingTodo?: Todo
  initialDate?: string
}

export default function FABModal({ selectedDate, onClose, onSaved, existingTodo, initialDate }: Props) {
  const [tab, setTab] = useState<TabType>(existingTodo ? 'todo' : 'event')
  const [categories, setCategories] = useState<Category[]>([])

  const [eventTitle, setEventTitle] = useState('')
  const [eventDescription, setEventDescription] = useState('')
  const [eventDate, setEventDate] = useState(
    `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
  )
  const [eventCategoryId, setEventCategoryId] = useState('')

  const [todoTitle, setTodoTitle] = useState(existingTodo?.title || '')
  const [todoDueDate, setTodoDueDate] = useState(existingTodo?.due_date || initialDate || '')
  const [todoCategoryId, setTodoCategoryId] = useState(existingTodo?.category_id || '')

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

  const handleSaveEvent = async () => {
    if (!eventTitle.trim()) return
    await supabase.from('events').insert({
      title: eventTitle.trim(),
      description: eventDescription.trim(),
      start_at: `${eventDate}T00:00:00`,
      end_at: `${eventDate}T23:59:00`,
      color: getCategoryColor(eventCategoryId),
      category_id: eventCategoryId || null,
    })
    onSaved()
    onClose()
  }

  const handleSaveTodo = async () => {
    if (!todoTitle.trim()) return
    if (existingTodo) {
      await supabase.from('todos').update({
        title: todoTitle.trim(),
        due_date: todoDueDate || null,
        category_id: todoCategoryId || null,
      }).eq('id', existingTodo.id)
    } else {
      await supabase.from('todos').insert({
        title: todoTitle.trim(),
        due_date: todoDueDate || null,
        category_id: todoCategoryId || null,
      })
    }
    onSaved()
    onClose()
  }

  const handleDeleteTodo = async () => {
    if (!existingTodo) return
    await supabase.from('todos').delete().eq('id', existingTodo.id)
    onSaved()
    onClose()
  }

  const showPicker = (e: React.MouseEvent<HTMLInputElement>) => {
    ;(e.target as HTMLInputElement).showPicker?.()
  }

  const inputClass = 'w-full px-4 py-3 rounded-xl border border-gray-200 text-base outline-none focus:border-blue-300 transition-colors'
  const dateClass = `${inputClass} cursor-pointer`
  const selectClass = `${inputClass} text-gray-500`

  return (
    <div
      className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-10 w-full max-w-2xl shadow-xl"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* 탭 */}
        {!existingTodo && (
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
            <button
              onClick={() => setTab('event')}
              className={`flex-1 py-2.5 rounded-lg text-base transition-all ${
                tab === 'event' ? 'bg-white text-gray-900 shadow-sm font-medium' : 'text-gray-500'
              }`}
            >
              일정
            </button>
            <button
              onClick={() => setTab('todo')}
              className={`flex-1 py-2.5 rounded-lg text-base transition-all ${
                tab === 'todo' ? 'bg-white text-gray-900 shadow-sm font-medium' : 'text-gray-500'
              }`}
            >
              할 일
            </button>
          </div>
        )}

        {/* 수정 모드 헤더 */}
        {existingTodo && (
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900">할 일 수정</h2>
            <button onClick={onClose} className="text-gray-300 hover:text-gray-500 text-2xl">×</button>
          </div>
        )}

        {tab === 'event' && !existingTodo ? (
          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="일정 제목"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              autoFocus
              className={inputClass}
            />
            <textarea
              placeholder="메모 (선택)"
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
              rows={4}
              className={`${inputClass} resize-none`}
            />
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">날짜</label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                onClick={showPicker}
                className={dateClass}
              />
            </div>
            <select
              value={eventCategoryId}
              onChange={(e) => setEventCategoryId(e.target.value)}
              className={selectClass}
            >
              <option value="">카테고리 선택</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <button
              onClick={handleSaveEvent}
              className="w-full py-3 bg-blue-500 text-white text-base rounded-xl hover:bg-blue-600 transition-colors mt-1"
            >
              저장
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="할 일 제목"
              value={todoTitle}
              onChange={(e) => setTodoTitle(e.target.value)}
              autoFocus
              className={inputClass}
            />
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">날짜</label>
              <input
                type="date"
                value={todoDueDate || ''}
                onChange={(e) => setTodoDueDate(e.target.value)}
                onClick={showPicker}
                className={dateClass}
              />
            </div>
            <select
              value={todoCategoryId}
              onChange={(e) => setTodoCategoryId(e.target.value)}
              className={selectClass}
            >
              <option value="">카테고리 선택</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <button
              onClick={handleSaveTodo}
              className="w-full py-3 bg-blue-500 text-white text-base rounded-xl hover:bg-blue-600 transition-colors mt-1"
            >
              {existingTodo ? '수정 완료' : '저장'}
            </button>
            {existingTodo && (
              <button
                onClick={handleDeleteTodo}
                className="w-full py-3 text-red-400 text-base rounded-xl hover:bg-red-50 transition-colors"
              >
                할 일 삭제
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Category } from '../lib/types'

interface Props {
  onClose: () => void
}

export default function CategoryManager({ onClose }: Props) {
  const [categories, setCategories] = useState<Category[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [name, setName] = useState('')
  const [color, setColor] = useState('#3b82f6')

  const colors = [
    '#3b82f6', '#10b981', '#f59e0b',
    '#ef4444', '#8b5cf6', '#6b7280',
  ]

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('created_at')
    if (data) setCategories(data)
  }

  const handleSave = async () => {
    if (!name.trim()) return
    if (editingCategory) {
      await supabase
        .from('categories')
        .update({ name: name.trim(), color })
        .eq('id', editingCategory.id)
    } else {
      await supabase.from('categories').insert({ name: name.trim(), color })
    }
    setName('')
    setColor('#3b82f6')
    setShowAddModal(false)
    setEditingCategory(null)
    fetchCategories()
  }

  const handleDelete = async (id: string) => {
    await supabase.from('categories').delete().eq('id', id)
    fetchCategories()
  }

  const openEdit = (cat: Category) => {
    setEditingCategory(cat)
    setName(cat.name)
    setColor(cat.color)
    setShowAddModal(true)
  }

  const openAdd = () => {
    setEditingCategory(null)
    setName('')
    setColor('#3b82f6')
    setShowAddModal(true)
  }

  return (
    <div
      className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ←
          </button>
          <span className="text-sm font-medium text-gray-900">카테고리 관리</span>
          <button
            onClick={openAdd}
            className="text-xs bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition-colors"
          >
            + 카테고리 추가
          </button>
        </div>

        {/* 카테고리 목록 */}
        <div className="p-4 flex flex-col gap-2 max-h-80 overflow-y-auto">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50"
            >
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              <span className="flex-1 text-sm text-gray-900">{cat.name}</span>
              <button
                onClick={() => openEdit(cat)}
                className="text-gray-300 hover:text-gray-500 p-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => handleDelete(cat.id)}
                className="text-gray-300 hover:text-red-400 p-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* 카테고리 추가/수정 모달 */}
        {showAddModal && (
          <div className="border-t border-gray-100 p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-900">
                {editingCategory ? '카테고리 수정' : '카테고리 추가'}
              </span>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-300 hover:text-gray-500 text-xl"
              >
                ×
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="카테고리 이름을 입력하세요"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-gray-400 transition-colors"
              />
              <div className="flex gap-2">
                {colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className="w-8 h-8 rounded-full transition-transform hover:scale-110"
                    style={{
                      backgroundColor: c,
                      outline: color === c ? `2px solid ${c}` : 'none',
                      outlineOffset: '2px',
                    }}
                  />
                ))}
              </div>
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-sm text-gray-500 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 py-2.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
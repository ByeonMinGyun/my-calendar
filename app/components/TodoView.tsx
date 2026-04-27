'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Todo, Category } from '../lib/types'

type Filter = 'all' | 'undone' | 'done'

interface Props {
  selectedCategories: string[]
}

export default function TodoView({ selectedCategories }: Props) {
  const [todos, setTodos] = useState<Todo[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [newTitle, setNewTitle] = useState('')
  const [newDueDate, setNewDueDate] = useState('')
  const [newCategoryId, setNewCategoryId] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  useEffect(() => {
    fetchTodos()
    fetchCategories()
  }, [selectedCategories])

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('created_at')
    if (data) setCategories(data)
  }

  const fetchTodos = async () => {
    let query = supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false })

    if (selectedCategories.length > 0) {
      query = query.in('category_id', selectedCategories)
    }

    const { data } = await query
    if (data) setTodos(data)
  }

  const addTodo = async () => {
    if (!newTitle.trim()) return
    await supabase.from('todos').insert({
      title: newTitle.trim(),
      due_date: newDueDate || null,
      category_id: newCategoryId || null,
    })
    setNewTitle('')
    setNewDueDate('')
    setNewCategoryId('')
    fetchTodos()
  }

  const toggleTodo = async (id: string, is_done: boolean) => {
    await supabase.from('todos').update({ is_done: !is_done }).eq('id', id)
    fetchTodos()
  }

  const deleteTodo = async (id: string) => {
    await supabase.from('todos').delete().eq('id', id)
    fetchTodos()
  }

  const getCategoryById = (id: string | null) =>
    categories.find((c) => c.id === id)

  const filteredTodos = todos.filter((t) => {
    if (filter === 'done') return t.is_done
    if (filter === 'undone') return !t.is_done
    return true
  })

  return (
    <div className="max-w-2xl mx-auto">
      {/* 입력 영역 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <input
            type="text"
            placeholder="할 일 추가..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTodo()}
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-300 transition-colors"
          />
          <button
            onClick={addTodo}
            className="px-4 py-2.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors flex-shrink-0"
          >
            + 할 일 추가
          </button>
        </div>
        <div className="flex gap-2">
          <input
            type="date"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-300 transition-colors text-gray-500"
          />
          <select
            value={newCategoryId}
            onChange={(e) => setNewCategoryId(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-300 transition-colors text-gray-500"
          >
            <option value="">카테고리 선택</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 필터 탭 */}
      <div className="flex gap-1 mb-4">
        {([['all', '전체'], ['undone', '미완료'], ['done', '완료']] as [Filter, string][]).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-4 py-1.5 rounded-lg text-sm transition-colors ${
              filter === value
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 할일 목록 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredTodos.length === 0 && (
          <p className="text-center text-sm text-gray-300 py-12">할 일이 없어요</p>
        )}
        {filteredTodos.map((todo, idx) => {
          const category = getCategoryById(todo.category_id)
          return (
            <div
              key={todo.id}
              className={`flex items-center gap-3 px-4 py-3.5 ${
                idx !== filteredTodos.length - 1 ? 'border-b border-gray-50' : ''
              }`}
            >
              <button
                onClick={() => toggleTodo(todo.id, todo.is_done)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  todo.is_done
                    ? 'bg-blue-500 border-blue-500'
                    : 'border-gray-300 hover:border-blue-300'
                }`}
              >
                {todo.is_done && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm truncate ${todo.is_done ? 'line-through text-gray-300' : 'text-gray-700'}`}>
                  {todo.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  {category && (
                    <span
                      className="text-xs px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: category.color + '20', color: category.color }}
                    >
                      {category.name}
                    </span>
                  )}
                  {todo.due_date && (
                    <span className="text-xs text-gray-400">
                      {new Date(todo.due_date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="text-gray-200 hover:text-red-400 transition-colors flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface Todo {
  id: string
  title: string
  is_done: boolean
  due_date: string | null
}

export default function TodoView() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTitle, setNewTitle] = useState('')
  const [newDueDate, setNewDueDate] = useState('')

  useEffect(() => {
    fetchTodos()
  }, [])

  const fetchTodos = async () => {
    const { data } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setTodos(data)
  }

  const addTodo = async () => {
    if (!newTitle.trim()) return
    await supabase.from('todos').insert({
      title: newTitle.trim(),
      due_date: newDueDate || null,
    })
    setNewTitle('')
    setNewDueDate('')
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

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex flex-col gap-2 mb-6">
        <input
          type="text"
          placeholder="할 일 추가..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTodo()}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-gray-400 transition-colors"
        />
        <div className="flex gap-2">
          <input
            type="date"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-gray-400 transition-colors text-gray-500"
          />
          <button
            onClick={addTodo}
            className="px-4 py-2.5 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
          >
            추가
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {todos.length === 0 && (
          <p className="text-center text-sm text-gray-300 py-8">
            할 일이 없어요
          </p>
        )}
        {todos.map((todo) => (
          <div
            key={todo.id}
            className="flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
          >
            <button
              onClick={() => toggleTodo(todo.id, todo.is_done)}
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                todo.is_done
                  ? 'bg-gray-900 border-gray-900'
                  : 'border-gray-300 hover:border-gray-400'
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
              {todo.due_date && (
                <p className="text-xs text-gray-300 mt-0.5">
                  {new Date(todo.due_date).toLocaleDateString('ko-KR')}
                </p>
              )}
            </div>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="text-gray-200 hover:text-gray-400 transition-colors text-lg flex-shrink-0"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
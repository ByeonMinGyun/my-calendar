export interface Category {
  id: string
  name: string
  color: string
  created_at: string
}

export interface Event {
  id: string
  title: string
  description: string
  start_at: string
  end_at: string
  color: string
  category_id: string | null
  created_at: string
}

export interface Todo {
  id: string
  title: string
  is_done: boolean
  due_date: string | null
  category_id: string | null
  created_at: string
}
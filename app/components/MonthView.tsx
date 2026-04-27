'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { Event, Todo } from '../lib/types'
import DayDetailModal from './DayDetailModal'
import EventDetailModal from './EventDetailModal'
import MultiDayEventModal from './MultiDayEventModal'
import FABModal from './FABModal'

interface Props {
  currentDate: Date
  setCurrentDate: (date: Date) => void
  selectedCategories: string[]
}

export default function MonthView({ currentDate, setCurrentDate, selectedCategories }: Props) {
  const [events, setEvents] = useState<Event[]>([])
  const [todos, setTodos] = useState<Todo[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null)
  const [draggingEvent, setDraggingEvent] = useState<Event | null>(null)
  const [draggingTodo, setDraggingTodo] = useState<Todo | null>(null)
  const [dragOverDay, setDragOverDay] = useState<number | null>(null)
  const [rangeDragStart, setRangeDragStart] = useState<number | null>(null)
  const [rangeDragEnd, setRangeDragEnd] = useState<number | null>(null)
  const [showMultiDayModal, setShowMultiDayModal] = useState(false)
  const [multiDayStart, setMultiDayStart] = useState<Date | null>(null)
  const [multiDayEnd, setMultiDayEnd] = useState<Date | null>(null)
  const isDraggingRange = useRef(false)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const blanks = Array.from({ length: firstDay }, (_, i) => i)

  const fetchEvents = async () => {
    const start = new Date(year, month, 1).toISOString()
    const end = new Date(year, month + 1, 0, 23, 59, 59).toISOString()
    let query = supabase
      .from('events')
      .select('*')
      .gte('start_at', start)
      .lte('end_at', end)

    if (selectedCategories.length > 0) {
      query = query.in('category_id', selectedCategories)
    }

    const { data } = await query
    if (data) setEvents(data)
  }

  const fetchTodos = async () => {
    const start = new Date(year, month, 1).toISOString().slice(0, 10)
    const end = new Date(year, month + 1, 0).toISOString().slice(0, 10)
    let query = supabase
      .from('todos')
      .select('*')
      .gte('due_date', start)
      .lte('due_date', end)

    if (selectedCategories.length > 0) {
      query = query.in('category_id', selectedCategories)
    }

    const { data } = await query
    if (data) setTodos(data)
  }

  const fetchAll = () => {
    fetchEvents()
    fetchTodos()
  }

  useEffect(() => {
    fetchAll()
  }, [year, month, selectedCategories])

  const getSingleEventsForDay = (day: number) =>
    events.filter((e) => {
      if (e.is_multi_day) return false
      const d = new Date(e.start_at)
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day
    })

  const getMultiDayEventsForDay = (day: number) => {
    const date = new Date(year, month, day)
    return events.filter((e) => {
      if (!e.is_multi_day) return false
      const start = new Date(e.start_at)
      const end = new Date(e.end_at)
      const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate())
      const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate())
      return date >= startDate && date <= endDate
    })
  }

  const isMultiDayStart = (event: Event, day: number) => {
    const start = new Date(event.start_at)
    return start.getFullYear() === year && start.getMonth() === month && start.getDate() === day
  }

  const isMultiDayEnd = (event: Event, day: number) => {
    const end = new Date(event.end_at)
    return end.getFullYear() === year && end.getMonth() === month && end.getDate() === day
  }

  const isWeekStart = (day: number) => new Date(year, month, day).getDay() === 0
  const isWeekEnd = (day: number) => new Date(year, month, day).getDay() === 6

  const getTodosForDay = (day: number) =>
    todos.filter((t) => {
      if (!t.due_date) return false
      const parts = t.due_date.split('-')
      return (
        parseInt(parts[0]) === year &&
        parseInt(parts[1]) - 1 === month &&
        parseInt(parts[2]) === day
      )
    })

  const toggleTodo = async (e: React.MouseEvent, id: string, is_done: boolean) => {
    e.stopPropagation()
    await supabase.from('todos').update({ is_done: !is_done }).eq('id', id)
    fetchTodos()
  }

  const handleEventDragStart = (e: React.DragEvent, event: Event) => {
    e.stopPropagation()
    setDraggingEvent(event)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleTodoDragStart = (e: React.DragEvent, todo: Todo) => {
    e.stopPropagation()
    setDraggingTodo(todo)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, day: number) => {
    e.preventDefault()
    if (draggingEvent || draggingTodo) setDragOverDay(day)
  }

  const handleDrop = async (e: React.DragEvent, day: number) => {
    e.preventDefault()
    setDragOverDay(null)
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    if (draggingEvent) {
      await supabase.from('events').update({
        start_at: `${dateStr}T00:00:00`,
        end_at: `${dateStr}T23:59:00`,
      }).eq('id', draggingEvent.id)
      setDraggingEvent(null)
      fetchEvents()
    }
    if (draggingTodo) {
      await supabase.from('todos').update({ due_date: dateStr }).eq('id', draggingTodo.id)
      setDraggingTodo(null)
      fetchTodos()
    }
  }

  const handleDragEnd = () => {
    setDraggingEvent(null)
    setDraggingTodo(null)
    setDragOverDay(null)
  }

  const handleMouseDown = (e: React.MouseEvent, day: number) => {
    if (e.button !== 0) return
    isDraggingRange.current = false
    setRangeDragStart(day)
    setRangeDragEnd(day)
  }

  const handleMouseEnter = (day: number) => {
    if (rangeDragStart !== null) {
      isDraggingRange.current = true
      setRangeDragEnd(day)
    }
  }

  const handleMouseUp = (e: React.MouseEvent, day: number) => {
    if (rangeDragStart === null) return
    if (isDraggingRange.current && rangeDragStart !== day) {
      const start = Math.min(rangeDragStart, day)
      const end = Math.max(rangeDragStart, day)
      setMultiDayStart(new Date(year, month, start))
      setMultiDayEnd(new Date(year, month, end))
      setShowMultiDayModal(true)
    } else {
      setSelectedDate(new Date(year, month, day))
    }
    setRangeDragStart(null)
    setRangeDragEnd(null)
    isDraggingRange.current = false
  }

  const isInRange = (day: number) => {
    if (rangeDragStart === null || rangeDragEnd === null) return false
    const min = Math.min(rangeDragStart, rangeDragEnd)
    const max = Math.max(rangeDragStart, rangeDragEnd)
    return day >= min && day <= max
  }

  const today = new Date()
  const isToday = (day: number) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === day

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
      <div className="grid grid-cols-7 border-b border-gray-100">
        {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
          <div
            key={d}
            className={`text-center text-sm py-3 font-medium ${
              i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-600'
            }`}
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 flex-1 select-none">
        {blanks.map((i) => (
          <div key={`blank-${i}`} className="border-b border-r border-gray-50 min-h-28" />
        ))}
        {days.map((day, idx) => {
          const singleEvents = getSingleEventsForDay(day)
          const multiEvents = getMultiDayEventsForDay(day)
          const dayTodos = getTodosForDay(day)
          const col = (firstDay + idx) % 7
          const isDragOver = dragOverDay === day
          const inRange = isInRange(day)
          const maxShow = 3

          return (
            <div
              key={day}
              onMouseDown={(e) => handleMouseDown(e, day)}
              onMouseEnter={() => handleMouseEnter(day)}
              onMouseUp={(e) => handleMouseUp(e, day)}
              onDragOver={(e) => handleDragOver(e, day)}
              onDrop={(e) => handleDrop(e, day)}
              className={`min-h-28 p-1.5 border-b border-r border-gray-50 cursor-pointer transition-colors ${
                inRange ? 'bg-blue-50' : isDragOver ? 'bg-blue-50' : 'hover:bg-gray-50'
              }`}
            >
              <div
                className={`text-sm w-7 h-7 flex items-center justify-center rounded-full mb-1 font-medium ${
                  isToday(day)
                    ? 'bg-blue-500 text-white'
                    : col === 0
                    ? 'text-red-400'
                    : col === 6
                    ? 'text-blue-400'
                    : 'text-gray-700'
                }`}
              >
                {day}
              </div>

              {/* 다일 일정 바 */}
              {multiEvents.map((e) => {
                const isStart = isMultiDayStart(e, day) || isWeekStart(day)
                const isEnd = isMultiDayEnd(e, day) || isWeekEnd(day)
                const borderStyle = `1.5px solid ${e.color}`
                const borderRadius = isStart && isEnd
                  ? '6px'
                  : isStart ? '6px 0 0 6px'
                  : isEnd ? '0 6px 6px 0'
                  : '0'
                return (
                  <div
                    key={e.id}
                    onMouseDown={(evt) => evt.stopPropagation()}
                    onClick={(evt) => { evt.stopPropagation(); setSelectedEvent(e) }}
                    className="h-6 mb-0.5 flex items-center cursor-pointer hover:opacity-80 transition-opacity"
                    style={{
                      backgroundColor: '#ffffff',
                      borderTop: borderStyle,
                      borderBottom: borderStyle,
                      borderLeft: isStart ? borderStyle : 'none',
                      borderRight: isEnd ? borderStyle : 'none',
                      borderRadius,
                      marginLeft: isStart ? '0px' : '-8px',
                      marginRight: isEnd ? '0px' : '-8px',
                    }}
                  >
                    {isStart && (
                      <span
                        className="text-sm font-medium truncate px-1.5"
                        style={{ color: e.color }}
                      >
                        {e.title}
                      </span>
                    )}
                  </div>
                )
              })}

              {/* 단일 일정 */}
              {singleEvents.slice(0, maxShow).map((e) => (
                <div
                  key={e.id}
                  draggable
                  onDragStart={(evt) => handleEventDragStart(evt, e)}
                  onDragEnd={handleDragEnd}
                  onMouseDown={(evt) => evt.stopPropagation()}
                  onClick={(evt) => { evt.stopPropagation(); setSelectedEvent(e) }}
                  className={`flex items-center gap-1 px-1 py-0.5 rounded cursor-pointer transition-colors mb-0.5 hover:bg-gray-100 ${
                    draggingEvent?.id === e.id ? 'opacity-40' : ''
                  }`}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: e.color }}
                  />
                  <span className="text-sm text-gray-700 truncate">{e.title}</span>
                </div>
              ))}

              {/* 할일 */}
              {dayTodos.slice(0, maxShow - singleEvents.length).map((t) => (
                <div
                  key={t.id}
                  draggable
                  onDragStart={(evt) => handleTodoDragStart(evt, t)}
                  onDragEnd={handleDragEnd}
                  onMouseDown={(evt) => evt.stopPropagation()}
                  className={`flex items-center gap-1 px-1 py-0.5 rounded transition-colors mb-0.5 hover:bg-gray-100 ${
                    draggingTodo?.id === t.id ? 'opacity-40' : ''
                  }`}
                >
                  <div
                    onClick={(evt) => toggleTodo(evt, t.id, t.is_done)}
                    className={`w-3 h-3 rounded border flex-shrink-0 flex items-center justify-center transition-colors cursor-pointer ${
                      t.is_done ? 'bg-blue-500 border-blue-500' : 'border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    {t.is_done && (
                      <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span
                    onClick={(evt) => { evt.stopPropagation(); setSelectedTodo(t) }}
                    className={`text-sm truncate cursor-pointer ${
                      t.is_done ? 'line-through text-gray-300' : 'text-gray-700 hover:text-blue-500'
                    }`}
                  >
                    {t.title}
                  </span>
                </div>
              ))}
            </div>
          )
        })}
      </div>

      {selectedDate && !selectedEvent && !selectedTodo && (
        <DayDetailModal
          date={selectedDate}
          onClose={() => setSelectedDate(null)}
          onSaved={fetchAll}
        />
      )}

      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onSaved={fetchAll}
        />
      )}

      {selectedTodo && (
        <FABModal
          selectedDate={currentDate}
          existingTodo={selectedTodo}
          onClose={() => setSelectedTodo(null)}
          onSaved={fetchAll}
        />
      )}

      {showMultiDayModal && multiDayStart && multiDayEnd && (
        <MultiDayEventModal
          startDate={multiDayStart}
          endDate={multiDayEnd}
          onClose={() => {
            setShowMultiDayModal(false)
            setMultiDayStart(null)
            setMultiDayEnd(null)
          }}
          onSaved={fetchAll}
        />
      )}
    </div>
  )
}
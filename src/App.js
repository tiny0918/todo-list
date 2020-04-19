import React, { useState, useEffect, useRef, useCallback, memo } from 'react'
import './App.css'
import { createSet, createAdd, createRemove, createToggle } from './actions'
let idSeq = Date.now()

const Control = memo(function Control(props) {
    const { dispatch } = props
    const inputRef = useRef()

    const onSubmit = (e) => {
        e.preventDefault()
        const newTodo = inputRef.current.value.trim()

        if (newTodo.length === 0) {
            return
        }
        dispatch(
            createAdd({
                id: ++idSeq,
                todo: newTodo,
                complete: false,
            })
        )
        inputRef.current.value = ''
    }

    return (
        <div className="control">
            <h1>Todos</h1>
            <form onSubmit={onSubmit}>
                <input
                    ref={inputRef}
                    type="text"
                    className="new-todo"
                    placeholder="What needs to be done?"
                />
            </form>
        </div>
    )
})

const TodoItem = memo(function TodoItem(props) {
    const {
        todo: { id, todo, complete },
        dispatch,
    } = props

    const onChange = () => {
        dispatch(createToggle(id))
    }
    const onRemove = () => {
        dispatch(createRemove(id))
    }
    return (
        <li className="todo-item">
            <input type="checkbox" checked={complete} onChange={onChange} />
            <label className={complete ? 'complete' : ''}>{todo}</label>
            <button onClick={onRemove}>&#xd7;</button>
        </li>
    )
})

const Todos = memo(function Todos(props) {
    const { todos, dispatch } = props
    return (
        <ul className="todos">
            {todos.map((todo) => {
                return (
                    <TodoItem key={todo.id} todo={todo} dispatch={dispatch} />
                )
            })}
        </ul>
    )
})

const LS_KEY = '_$-todos_'

function TodoList() {
    const [todos, setTodos] = useState([])

    const dispatch = useCallback((action) => {
        const { type, payload } = action
        switch (type) {
            case 'set':
                setTodos(payload)
                break
            case 'add':
                setTodos((todos) => [...todos, payload])
                break
            case 'remove':
                setTodos((todos) => todos.filter((todo) => todo.id !== payload))
                break
            case 'toggle':
                setTodos((todos) =>
                    todos.map((todo) => {
                        return todo.id === payload
                            ? {
                                  ...todo,
                                  complete: !todo.complete,
                              }
                            : todo
                    })
                )
                break
            default:
        }
    }, [])

    useEffect(() => {
        const todos = JSON.parse(localStorage.getItem(LS_KEY)) || []
        dispatch(createSet(todos))
    }, [])

    useEffect(() => {
        localStorage.setItem(LS_KEY, JSON.stringify(todos))
    }, [todos])

    return (
        <div className="todo-list">
            <Control dispatch={dispatch} />
            <Todos todos={todos} dispatch={dispatch} />
        </div>
    )
}

export default TodoList

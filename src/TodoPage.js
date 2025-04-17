import React, { useState, useEffect } from 'react';
import './App.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AddTodo from './components/AddTodo';
import TodoList from './components/ToDoList';
import FilterButtons from './components/FilterButtons';

import {
    getTodosFromFirestore,
    deleteTodoFromFirestore,
    updateTodoInFirestore,
    toggleTodoInFirestore,
    auth
} from './firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

function TodoPage() {
    const [todos, setTodos] = useState([]);
    const [filter, setFilter] = useState("active");
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                try {
                    const todosFromFirestore = await getTodosFromFirestore();
                    setTodos(todosFromFirestore);
                } catch (error) {
                    console.error("Görevler alınamadı", error);
                }
            }
        });

        return () => unsubscribe();
    }, []);

    const refreshTodos = async () => {
        const todosFromFirestore = await getTodosFromFirestore();
        setTodos(todosFromFirestore);
    };

    const handleLogout = async () => {
        await signOut(auth);
        navigate('/');
    };

    return (
        <div className="todo-page">
            <h1>To-Do List</h1>

            <FilterButtons filter={filter} setFilter={setFilter} />
            <AddTodo onTodoAdded={refreshTodos} />

            <TodoList
                todos={todos}
                filter={filter}
                refreshTodos={refreshTodos}
                deleteTodoFromFirestore={deleteTodoFromFirestore}
                updateTodoInFirestore={updateTodoInFirestore}
                toggleTodoInFirestore={toggleTodoInFirestore}
            />

            <div className="logout-container">
                <button onClick={handleLogout}>Çıkış Yap</button>
            </div>

            <ToastContainer position="bottom-right" autoClose={2000} />
        </div>
    );
}

export default TodoPage;



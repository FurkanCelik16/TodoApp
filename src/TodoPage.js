import React, { useState, useEffect } from 'react';
import './App.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import {
    addTodoToFirestore,
    getTodosFromFirestore,
    deleteTodoFromFirestore,
    updateTodoInFirestore,
    toggleTodoInFirestore,
    auth
} from './firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

function TodoPage() {
    const [newDate, setNewDate] = useState(new Date());
    const [todos, setTodos] = useState([]);
    const [newTodo, setNewTodo] = useState("");
    const [editingIndex, setEditingIndex] = useState(null);
    const [editingText, setEditingText] = useState("");
    const [editingDate, setEditingDate] = useState(new Date());
    const [filter, setFilter] = useState("active"); // Aktif ve geçmiş görevleri filtrelemek için
    const navigate = useNavigate();

    // Kullanıcı girişini kontrol et ve görevleri al
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

    // Görevleri filtreleme
    const filteredTodos = todos.filter(todo => {
        const isPast = new Date(todo.dueDate.seconds * 1000) < new Date();
        if (filter === "active") {
            return !isPast; // Aktif görevler
        }
        return isPast; // Zamanı geçmiş görevler
    });

    // Yeni görev ekle
    const addTodo = async () => {
        if (newTodo.trim() === "") return;

        try {
            // Benzersiz ID oluştur
            const id = Date.now().toString();  // Zaman damgası kullanarak ID oluştur
            await addTodoToFirestore(newTodo, newDate, id);  // ID'yi de gönderiyoruz
            const todosFromFirestore = await getTodosFromFirestore();
            setTodos(todosFromFirestore);
            setNewTodo("");
            setNewDate(new Date()); // datepicker'ı sıfırla
            toast.success("Görev başarıyla eklendi!");
        } catch (error) {
            toast.error("Görev eklenemedi!");
        }
    };

    // Görev tamamla veya iptal et
    const toggleTodo = async (id) => {
        const todo = todos.find(t => t.id === id);  // Görevi ID'ye göre bul
        if (!todo) return;

        const updatedTodo = { ...todo, completed: !todo.completed };
        try {
            await toggleTodoInFirestore(id, updatedTodo);  // ID'yi kullanarak doğru görevi güncelle
            const todosFromFirestore = await getTodosFromFirestore();
            setTodos(todosFromFirestore);
            toast.info(updatedTodo.completed ? "Görev tamamlandı!" : "Görev yapılmadı olarak işaretlendi!");
        } catch (error) {
            toast.error("Görev durumu güncellenemedi!");
        }
    };

    // Görevi sil
    const deleteTodo = async (id) => {
        const confirmed = window.confirm("Silmek istediğinize emin misiniz?");
        if (confirmed) {
            try {
                await deleteTodoFromFirestore(id);  // ID'yi kullanarak doğru görevi sil
                const todosFromFirestore = await getTodosFromFirestore();
                setTodos(todosFromFirestore);
                toast.error("Görev silindi!");
            } catch (error) {
                toast.error("Görev silinemedi!");
            }
        }
    };

    // Düzenleme başlat
    const startEditing = (id) => {
        const todo = todos.find(t => t.id === id);  // Görevi ID'ye göre bul
        if (!todo) return;

        setEditingIndex(id);
        setEditingText(todo.text);
        setEditingDate(todo.dueDate?.seconds
            ? new Date(todo.dueDate.seconds * 1000)
            : new Date());
    };

    // Düzenlemeyi kaydet
    const saveEditing = async () => {
        if (editingText.trim() === '') return;

        const updatedTodo = {
            ...todos.find(t => t.id === editingIndex),
            text: editingText,
            dueDate: editingDate
        };

        try {
            await updateTodoInFirestore(editingIndex, updatedTodo);  // ID'yi kullanarak doğru görevi güncelle
            const todosFromFirestore = await getTodosFromFirestore();
            setTodos(todosFromFirestore);
            setEditingIndex(null);
            setEditingText("");
            toast.success("Görev başarıyla düzenlendi!");
        } catch (error) {
            toast.error("Görev düzenlenemedi!");
        }
    };

    // Çıkış yap
    const handleLogout = async () => {
        await signOut(auth);
        navigate('/');
    };

    return (
        <div className="todo-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <h1>To-Do List</h1>

            {/* Filtreleme Butonları */}
            <div className="filter-buttons">
                <button onClick={() => setFilter("active")} style={{ marginBottom: '20px' }}>Aktif Görevler</button>
                <button onClick={() => setFilter("past")}>Zamanı Geçmiş Görevler</button>
            </div>

            {/* Yeni Görev Ekleme */}
            <div className="todo-input">
                <input
                    type="text"
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    placeholder="Yeni görev ekle"
                />
                <DatePicker
                    selected={newDate}
                    onChange={(date) => setNewDate(date)}
                    showTimeSelect
                    dateFormat="Pp"
                    placeholderText="Tarih & saat seç"
                />
                <button onClick={addTodo}>Ekle</button>
            </div>

            {/* Görev Listesi */}
            <ul style={{ flexGrow: 1 }}>
                {filteredTodos.map((todo) => (
                    <li key={todo.id} className={todo.completed ? "completed" : ""}>
                        {editingIndex === todo.id ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                                <input
                                    type="text"
                                    value={editingText}
                                    onChange={(e) => setEditingText(e.target.value)}
                                    className="edit-input"
                                />
                                <DatePicker
                                    selected={editingDate}
                                    onChange={(date) => setEditingDate(date)}
                                    showTimeSelect
                                    dateFormat="Pp"
                                    className="edit-datepicker"
                                    placeholderText="Tarih & saat düzenle"
                                />
                                <button onClick={saveEditing} className="save-button">Kaydet</button>
                            </div>
                        ) : (
                            <>
                                <span>{todo.text}</span>

                                {todo.dueDate && (
                                    <small style={{ marginLeft: "10px", color: "black", fontSize: "1rem" }}>
                                        ({new Date(todo.dueDate.seconds * 1000).toLocaleString([], {
                                            year: 'numeric',
                                            month: '2-digit',
                                            day: '2-digit',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })})
                                    </small>
                                )}

                                <button onClick={() => toggleTodo(todo.id)}>
                                    {todo.completed ? "Tamamlandı" : "Yapıldı"}
                                </button>
                                <button onClick={() => startEditing(todo.id)}>Düzenle</button>
                                <button onClick={() => deleteTodo(todo.id)}>Sil</button>
                            </>
                        )}
                    </li>
                ))}
            </ul>

            {/* Çıkış Butonu */}
            <div className="logout-container">
                <button onClick={handleLogout}>Çıkış Yap</button>
            </div>

            <ToastContainer position="bottom-right" autoClose={2000} />
        </div>
    );
}

export default TodoPage;


import React, { useState } from 'react';
import DatePicker from "react-datepicker";
import { toast } from 'react-toastify';

function TodoList({
    todos,
    filter,
    refreshTodos,
    deleteTodoFromFirestore,
    updateTodoInFirestore,
    toggleTodoInFirestore
}) {
    const [editingIndex, setEditingIndex] = useState(null);
    const [editingText, setEditingText] = useState("");
    const [editingDate, setEditingDate] = useState(new Date());

    const filteredTodos = todos.filter(todo => {
        const isPast = new Date(todo.dueDate.seconds * 1000) < new Date();
        return filter === "active" ? !isPast : isPast;
    });

    const startEditing = (todo) => {
        setEditingIndex(todo.id);
        setEditingText(todo.text);
        setEditingDate(todo.dueDate?.seconds ? new Date(todo.dueDate.seconds * 1000) : new Date());
    };

    const saveEditing = async () => {
        if (editingText.trim() === '') return;

        try {
            await updateTodoInFirestore(editingIndex, {
                ...todos.find(t => t.id === editingIndex),
                text: editingText,
                dueDate: editingDate
            });
            await refreshTodos();
            setEditingIndex(null);
            setEditingText("");
            toast.success("Görev başarıyla düzenlendi!");
        } catch {
            toast.error("Görev düzenlenemedi!");
        }
    };

    const handleToggle = async (todo) => {
        try {
            await toggleTodoInFirestore(todo.id, {
                ...todo,
                completed: !todo.completed
            });
            await refreshTodos();
            toast.info(todo.completed ? "Görev yapılmadı olarak işaretlendi!" : "Görev tamamlandı!");
        } catch {
            toast.error("Görev durumu güncellenemedi!");
        }
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm("Silmek istediğinize emin misiniz?");
        if (confirmed) {
            try {
                await deleteTodoFromFirestore(id);
                await refreshTodos();
                toast.error("Görev silindi!");
            } catch {
                toast.error("Görev silinemedi!");
            }
        }
    };

    return (
        <ul>
            {filteredTodos.map((todo) => (
                <li key={todo.id} className={todo.completed ? "completed" : ""}>
                    {editingIndex === todo.id ? (
                        <div className="edit-section">
                            <input
                                type="text"
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                            />
                            <DatePicker
                                selected={editingDate}
                                onChange={(date) => setEditingDate(date)}
                                showTimeSelect
                                dateFormat="Pp"
                            />
                            <button onClick={saveEditing}>Kaydet</button>
                        </div>
                    ) : (
                        <>
                            <span>{todo.text}</span>
                            {todo.dueDate && (
                                <small>
                                    ({new Date(todo.dueDate.seconds * 1000).toLocaleString()})
                                </small>
                            )}
                            <button onClick={() => handleToggle(todo)}>
                                {todo.completed ? "Tamamlandı" : "Yapıldı"}
                            </button>
                            <button onClick={() => startEditing(todo)}>Düzenle</button>
                            <button onClick={() => handleDelete(todo.id)}>Sil</button>
                        </>
                    )}
                </li>
            ))}
        </ul>
    );
}

export default TodoList;

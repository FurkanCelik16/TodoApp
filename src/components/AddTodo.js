import React, { useState } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addTodoToFirestore } from '../firebase';
import { toast } from 'react-toastify';

function AddTodo({ onTodoAdded }) {
    const [newTodo, setNewTodo] = useState("");
    const [newDate, setNewDate] = useState(new Date());

    const addTodo = async () => {
        if (newTodo.trim() === "") return;

        try {
            const id = Date.now().toString();
            await addTodoToFirestore(newTodo, newDate, id);
            await onTodoAdded();
            setNewTodo("");
            setNewDate(new Date());
            toast.success("Görev başarıyla eklendi!");
        } catch {
            toast.error("Görev eklenemedi!");
        }
    };

    return (
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
    );
}

export default AddTodo;

import React from 'react';

function FilterButtons({ filter, setFilter }) {
    return (
        <div className="filter-buttons">
            <button
                onClick={() => setFilter("active")}
                className={filter === "active" ? "active" : ""}
            >
                Aktif Görevler
            </button>
            <button
                onClick={() => setFilter("past")}
                className={filter === "past" ? "active" : ""}
            >
                Zamanı Geçmiş Görevler
            </button>
        </div>
    );
}

export default FilterButtons;

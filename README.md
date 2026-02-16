# Task Manager (React)

## 🇦🇿 Haqqında

Bu layihə React ilə hazırlanmış inkişaf etmiş Task Manager tətbiqidir.  
Sadə CRUD tətbiqi olmaqdan əlavə, Undo/Redo sistemi, keyboard shortcuts və localStorage persist kimi real məhsul xüsusiyyətlərinə malikdir.

## 🇬🇧 About

An advanced Task Manager built with React.  
Beyond basic CRUD functionality, it includes Undo/Redo history, keyboard shortcuts, and persistent state using localStorage.

---

## 🚀 Live Demo
> Deploy etdikdən sonra link əlavə olunacaq.

---

## ✨ Features

### Core
- Add / Edit / Delete tasks
- Toggle completed state
- Inline edit (double click → edit mode)
- Auto-save on blur
- Auto-select text when editing

### Filtering & Search
- Filter: All / Active / Completed
- Real-time search
- Clear search (× button)
- "No results found" state
- Empty state UI

### Keyboard Shortcuts
- `/` → Focus search
- `1` → All
- `2` → Active
- `3` → Completed
- `Esc` → Clear search
- `Ctrl + Z` → Undo
- `Ctrl + Y` or `Ctrl + Shift + Z` → Redo

### Advanced Logic
- Undo/Redo system with history stack
- Persistent history (refresh sonrası da işləyir)
- History limit applied (to prevent storage overflow)
- LocalStorage persistence (tasks, filter, query)

---

## 🛠 Tech Stack

- React (Hooks: useState, useEffect, useRef)
- JavaScript (ES6+)
- CSS

---

## 📦 Getting Started

```bash
git clone https://github.com/Shaiq2022/task-manager.git
cd task-manager
npm install
npm start

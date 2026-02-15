import {useEffect,useRef, useState } from "react";



function TaskItem({ task, deleteTask, toggleTask, editTask }) { // editTask-i prop olaraq əlavə edin
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.title);
  const inputRef = useRef(null);
  useEffect(() => {
  if (isEditing) {
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
  }
}, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (editValue.trim()) {
      editTask(task.id, editValue); // App.js-də state yeniləyin
    } else {
      setEditValue(task.title); // Boşdursa, əvvəlki dəyəri saxlayın
    }
  };

  return (
    <li className={`task-item ${task.completed ? "completed" : ""}`}>
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => toggleTask(task.id)}
      />
      {isEditing ? (
        <input
         ref = {inputRef}
          type="text"
          value={editValue}
          //autoFocus
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          className="edit-input" // Yeni sinif əlavə edin
        />
      ) : (
        <span onDoubleClick={() => setIsEditing(true)}>
          {task.title}
        </span>
      )}
      <button
  onClick={() => {
    const ok = window.confirm(`Silinsin? "${task.title}"`);
    if (ok) deleteTask(task.id);
  }}
  aria-label="Delete task"
  title="Sil"
>
  X
</button>

    </li>
  );
}

export default TaskItem;

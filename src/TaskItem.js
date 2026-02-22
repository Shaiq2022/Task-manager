import {useEffect,useRef, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";


function TaskItem({ task, deleteTask, toggleTask, editTask }) { // editTask-i prop olaraq əlavə edin
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.title);
  const inputRef = useRef(null);
   const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: String(task.id) });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
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
    <li
  ref={setNodeRef}
  style={style}
  className={`task-item ${task.completed ? "completed" : ""}`}
>
  <button
  className="drag-handle"
  type="button"
  {...attributes}
  {...listeners}
>
  ⠿
</button>
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

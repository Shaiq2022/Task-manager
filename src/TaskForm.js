import { useState } from "react";

function TaskForm({ addTask }) {
  const [title, setTitle] = useState("");
 const canAdd = title.trim().length > 0;
  const onSubmit = (e) => {
    e.preventDefault();
    const value = title.trim();
    if (!value) return;
    addTask(value);
    setTitle("");
  };

  return (
    <form className="task-form" onSubmit={onSubmit}>
      <input
        type="text"
        placeholder="Yeni task yaz..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <button type="submit" disabled={!canAdd} >Add</button>
    </form>
  );
}

export default TaskForm;

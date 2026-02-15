import { useEffect,useRef, useState } from "react";
import TaskForm from "./TaskForm";
import TaskList from "./TaskList";
import "./index.css";
import Header from "./Header";

function App() {
  
  // 🔁 HISTORY COMMIT HELPER
const HISTORY_LIMIT = 50;
  const DEFAULT_TASKS = [
    { id: 1, title: "React öyrən", completed: false },
    { id: 2, title: "Task Manager yaz", completed: true },
  ];

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("tasks");
    return saved ? JSON.parse(saved) : DEFAULT_TASKS;
  });
// ✅ Undo / Redo üçün history
const [past, setPast] = useState(() => {
  const saved = localStorage.getItem("history_past");
  return saved ? JSON.parse(saved) : [];
});

const [future, setFuture] = useState(() => {
  const saved = localStorage.getItem("history_future");
  return saved ? JSON.parse(saved) : [];
});


 const [filter, setFilter] = useState(() => {
  const saved = localStorage.getItem("filter");
  return saved ? saved : "all";
});
 // all | active | completed
const [query, setQuery] = useState(() => {
  const saved = localStorage.getItem("query");
  return saved ? saved : "";
});
const searchRef = useRef(null);

useEffect(() => {
  localStorage.setItem("filter", filter);
}, [filter]);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);
useEffect(() => {
  localStorage.setItem("query", query);
}, [query]);

 
useEffect(() => {
  localStorage.setItem("history_past", JSON.stringify(past));
}, [past]);

useEffect(() => {
  localStorage.setItem("history_future", JSON.stringify(future));
}, [future]);



const commitTasks = (nextTasks) => {
  setPast((p) => {
    const nextPast = [...p, tasks];
    return nextPast.length > HISTORY_LIMIT
      ? nextPast.slice(nextPast.length - HISTORY_LIMIT)
      : nextPast;
  });

  setTasks(nextTasks);   // ✅ düz olan budur (commitTasks-i çağırmaq YOX)
  setFuture([]);         // ✅ yeni dəyişiklik → redo təmizlənir
};
 const toggleTask = (id) => {
    commitTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };
const undo = () => {
  setPast((p) => {
    if (p.length === 0) return p;

    const previous = p[p.length - 1];

    // indiki vəziyyəti redo üçün saxla
    setFuture((f) => [tasks, ...f]);

    // geri qayıt
    setTasks(previous);

    return p.slice(0, -1);
  });
};

const redo = () => {
  setFuture((f) => {
    if (f.length === 0) return f;

    const next = f[0];

    // indiki vəziyyəti undo üçün saxla
    setPast((p) => [...p, tasks]);

    // irəli get
    setTasks(next);

    return f.slice(1);
  });
};




useEffect(() => {
  const onKeyDown = (e) => {
    // İstifadəçi input/textarea-da yazırsa, qlobal qısayollar işləməsin
    const tag = e.target?.tagName?.toLowerCase();
    const isTyping = tag === "input" || tag === "textarea";

    // "/" → search fokus
    if (e.key === "/") {
      // inputun içində yazanda "/" normal yazılsın
      if (isTyping) return;

      e.preventDefault();
      searchRef.current?.focus();
      searchRef.current?.select()
      return;
    }

    // 1/2/3 → filter dəyiş
    if (!isTyping) {
      if (e.key === "1") setFilter("all");
      if (e.key === "2") setFilter("active");
      if (e.key === "3") setFilter("completed");
    }
    // Ctrl+Z / Ctrl+Y / Ctrl+Shift+Z → Undo/Redo
    const isMac = navigator.platform.toUpperCase().includes("MAC");
    const mod = isMac ? e.metaKey : e.ctrlKey;

    if (mod && !isTyping) {
      // Undo
      if (e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }

      // Redo
      if (
        e.key.toLowerCase() === "y" ||
        (e.key.toLowerCase() === "z" && e.shiftKey)
      ) {
        e.preventDefault();
        redo();
        return;
      }
    }

    // Esc → search-i təmizlə (istəsən)
    if (e.key === "Escape") {
      // inputda olanda da işləsin deyə burada isTyping yoxlamırıq
      if (query) setQuery("");
      // istəsən fokus da götürsün:
      // searchRef.current?.blur();
    }
  };
  
// 🔁 HISTORY COMMIT HELPER

  window.addEventListener("keydown", onKeyDown);
  return () => window.removeEventListener("keydown", onKeyDown);
}, [query, tasks]);

  const deleteTask = (id) => {
    commitTasks(tasks.filter((task) => task.id !== id));
  };

  const addTask = (title) => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    const newTask = {
      id: Date.now(),
      title: trimmedTitle,
      completed: false,
    };

    commitTasks([...tasks, newTask]);
  };

  const editTask = (id, newTitle) => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;

    commitTasks(
      tasks.map((task) => (task.id === id ? { ...task, title: trimmed } : task))
    );
  };

  const clearCompleted = () => {
    commitTasks(tasks.filter((task) => !task.completed));
  };

 const filteredTasks = tasks.filter((task) => {
  // 1) filter (all/active/completed)
  if (filter === "active" && task.completed) return false;
  if (filter === "completed" && !task.completed) return false;

  // 2) search (title daxilində axtarış)
  const q = query.trim().toLowerCase();
  if (!q) return true;

  return task.title.toLowerCase().includes(q);
});


  const activeCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const taskText = activeCount === 1 ? "task" : "tasks";

  return (
    <div className="app">
      <Header />

      <TaskForm addTask={addTask} />
   <div className="search-wrap">
  <input
    ref={searchRef}
    type="text"
    placeholder="Task axtar..."
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    className="search-input"
  />

  {query && (
    <button
      type="button"
      className="search-clear"
      onClick={() => {
        setQuery("");
        searchRef.current?.focus();
      }}
      aria-label="Search-i təmizlə"
      title="Təmizlə"
    >
      ×
    </button>
  )}
</div>

     {tasks.length === 0 ? (
  <div className="empty-state">
    <h3>No tasks yet</h3>
    <p>Yeni task əlavə et və məhsuldar ol 🚀</p>
  </div>
) : filteredTasks.length === 0 ? (
  <div className="no-results">
    <h3>Nəticə tapılmadı</h3>
    <p>
      <b>{query}</b> üçün uyğun task yoxdur. Filteri dəyiş və ya axtarışı təmizlə.
    </p>
  </div>
) : (
  <TaskList
    tasks={filteredTasks}
    deleteTask={deleteTask}
    toggleTask={toggleTask}
    editTask={editTask}
  />
)}


      {tasks.length > 0 && (
        <div className="task-footer">
          <span>
            {activeCount} {taskText} left
          </span>

          <div className="filters">
            <button
              onClick={() => setFilter("all")}
              className={filter === "all" ? "active" : ""}
            >
              All
            </button>

            <button
              onClick={() => setFilter("active")}
              className={filter === "active" ? "active" : ""}
            >
              Active
            </button>

            <button
              onClick={() => setFilter("completed")}
              className={filter === "completed" ? "active" : ""}
            >
              Completed
            </button>
            <button onClick={() => setFilter("all")}>Reset filter</button>

          </div>

          {completedCount > 0 && (
            <button onClick={clearCompleted}>Clear completed</button>
          )}
          <button onClick={undo} disabled={past.length === 0}>Undo</button>
<button onClick={redo} disabled={future.length === 0}>Redo</button>

        </div>
        
      )}
    </div>
  );
}

export default App;

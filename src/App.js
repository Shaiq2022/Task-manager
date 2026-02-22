import { useEffect, useRef, useState, useCallback } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import TaskForm from "./TaskForm";
import TaskList from "./TaskList";
import "./index.css";
import Header from "./Header";

function App() {
  const HISTORY_LIMIT = 50;

  const DEFAULT_TASKS = [
    { id: 1, title: "React öyrən", completed: false },
    { id: 2, title: "Task Manager yaz", completed: true },
  ];

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("tasks");
    return saved ? JSON.parse(saved) : DEFAULT_TASKS;
  });

  // undo/redo üçün "ən son tasks" həmişə əlçatan olsun
  const tasksRef = useRef(tasks);
  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

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

  const [query, setQuery] = useState(() => {
    const saved = localStorage.getItem("query");
    return saved ? saved : "";
  });

  const searchRef = useRef(null);

  // localStorage sync
  useEffect(() => localStorage.setItem("tasks", JSON.stringify(tasks)), [tasks]);
  useEffect(() => localStorage.setItem("filter", filter), [filter]);
  useEffect(() => localStorage.setItem("query", query), [query]);
  useEffect(() => localStorage.setItem("history_past", JSON.stringify(past)), [past]);
  useEffect(() => localStorage.setItem("history_future", JSON.stringify(future)), [future]);

  // ✅ History ilə tasks dəyişmək üçün helper
  const commitTasks = useCallback(
    (updater) => {
      setTasks((prev) => {
        const nextTasks = typeof updater === "function" ? updater(prev) : updater;

        setPast((p) => {
          const nextPast = [...p, prev];
          return nextPast.length > HISTORY_LIMIT
            ? nextPast.slice(nextPast.length - HISTORY_LIMIT)
            : nextPast;
        });

        setFuture([]); // yeni dəyişiklik => redo təmizlə
        return nextTasks;
      });
    },
    [HISTORY_LIMIT]
  );

  // ✅ Filter + Search tətbiq olunmuş görünən task-lar
  const filteredTasks = tasks.filter((task) => {
    if (filter === "active" && task.completed) return false;
    if (filter === "completed" && !task.completed) return false;

    const q = query.trim().toLowerCase();
    if (!q) return true;

    return task.title.toLowerCase().includes(q);
  });

  // ✅ DnD reorder: yalnız UI-da görünənlərin sırasını dəyişir
  const reorderTasks = useCallback(
    (activeId, overId, visibleIdsFromUI) => {
      const aId = String(activeId);
      const oId = String(overId);
      if (aId === oId) return;

      const visibleIds = (visibleIdsFromUI || []).map(String);
      const oldIndex = visibleIds.indexOf(aId);
      const newIndex = visibleIds.indexOf(oId);
      if (oldIndex === -1 || newIndex === -1) return;

      const newVisibleIds = arrayMove(visibleIds, oldIndex, newIndex);

      commitTasks((prev) => {
        const visibleSet = new Set(visibleIds);
        const byId = new Map(prev.map((t) => [String(t.id), t]));

        let i = 0;
        return prev.map((t) => {
          const id = String(t.id);
          if (!visibleSet.has(id)) return t;
          const nextId = newVisibleIds[i++];
          return byId.get(nextId);
        });
      });
    },
    [commitTasks]
  );

  const toggleTask = (id) => {
    commitTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id) => {
    commitTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const addTask = (title) => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    const newTask = {
      id: Date.now(),
      title: trimmedTitle,
      completed: false,
    };

    commitTasks((prev) => [...prev, newTask]);
  };

  const editTask = (id, newTitle) => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;

    commitTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, title: trimmed } : task))
    );
  };

  const clearCompleted = () => {
    commitTasks((prev) => prev.filter((task) => !task.completed));
  };

  const undo = useCallback(() => {
    setPast((p) => {
      if (p.length === 0) return p;

      const previous = p[p.length - 1];
      setFuture((f) => [tasksRef.current, ...f]);
      setTasks(previous);

      return p.slice(0, -1);
    });
  }, []);

  const redo = useCallback(() => {
    setFuture((f) => {
      if (f.length === 0) return f;

      const next = f[0];
      setPast((p) => [...p, tasksRef.current]);
      setTasks(next);

      return f.slice(1);
    });
  }, []);

  // ✅ Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e) => {
      const tag = e.target?.tagName?.toLowerCase();
      const isTyping = tag === "input" || tag === "textarea";

      if (e.key === "/") {
        if (isTyping) return;
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
        return;
      }

      if (!isTyping) {
        if (e.key === "1") setFilter("all");
        if (e.key === "2") setFilter("active");
        if (e.key === "3") setFilter("completed");
      }

      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const mod = isMac ? e.metaKey : e.ctrlKey;

      if (mod && !isTyping) {
        if (e.key.toLowerCase() === "z" && !e.shiftKey) {
          e.preventDefault();
          undo();
          return;
        }

        if (e.key.toLowerCase() === "y" || (e.key.toLowerCase() === "z" && e.shiftKey)) {
          e.preventDefault();
          redo();
          return;
        }
      }

      if (e.key === "Escape") {
        if (query) setQuery("");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [query, undo, redo]);

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
          reorderTasks={reorderTasks}
        />
      )}

      {tasks.length > 0 && (
        <div className="task-footer">
          <span>
            {activeCount} {taskText} left
          </span>

          <div className="filters">
            <button onClick={() => setFilter("all")} className={filter === "all" ? "active" : ""}>
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

          {completedCount > 0 && <button onClick={clearCompleted}>Clear completed</button>}

          <button onClick={undo} disabled={past.length === 0}>
            Undo
          </button>
          <button onClick={redo} disabled={future.length === 0}>
            Redo
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
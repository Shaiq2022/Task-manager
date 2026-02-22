import TaskItem from "./TaskItem";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

function TaskList({ tasks, deleteTask, toggleTask, editTask, reorderTasks }) {

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) return;
    if (active.id === over.id) return;

   reorderTasks(active.id, over.id, tasks.map(t => String(t.id)));
  };

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={tasks.map((t) => String(t.id))}
        strategy={verticalListSortingStrategy}
      >
        <ul>
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              deleteTask={deleteTask}
              toggleTask={toggleTask}
              editTask={editTask}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

export default TaskList;
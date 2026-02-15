import TaskItem from "./TaskItem";

function TaskList({ tasks, deleteTask, toggleTask, editTask }) { // editTask-i prop olaraq əlavə edin
  return (
    <ul>
      {tasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          deleteTask={deleteTask}
          toggleTask={toggleTask}
          editTask={editTask} // editTask-i ötürün
        />
      ))}
    </ul>
  );
}

export default TaskList;

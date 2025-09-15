import React from 'react';
import TasksPage from './TasksPage';

function TasksPageWrapper({ allTasks, selectedRange, goBack }) {
  if (!selectedRange || !allTasks.length) {
    return <div>Загрузка...</div>;
  }

  // Пример: selectedRange = '1-10'
  const [start, end] = selectedRange.split('-').map(Number);

  const selectedTasks = allTasks.filter(task => task.id >= start && task.id <= end);

  if (selectedTasks.length === 0) {
    return <div>Нет задач</div>;
  }

  return (
    <TasksPage
      tasks={selectedTasks}
      goBack={goBack}
    />
  );
}

export default TasksPageWrapper;

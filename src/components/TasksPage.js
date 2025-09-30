import React, { useEffect, useState } from 'react';
import BackButton from './BackButton';
import ProgressBar from './ProgressBar';
import Task from './Task';
import {
  isTaskCorrect,
  saveCorrectAnswer,
  clearAnswersByIds
} from '../utils/storage';

import '../styles/tasksPage.css';

function TasksPage({ tasks, goBack }) {
  const [correctTaskIds, setCorrectTaskIds] = useState([]);

  // Загружаем решённые задачи при первом рендере
  useEffect(() => {
    const correctIds = tasks
      .filter(task => isTaskCorrect(task.id))
      .map(task => task.id);
    setCorrectTaskIds(correctIds);
  }, [tasks]);

  const handleCorrectAnswer = (taskId) => {
    if (!correctTaskIds.includes(taskId)) {
      saveCorrectAnswer(taskId);
      setCorrectTaskIds(prev => [...prev, taskId]);
    }
  };

  const resetCurrentRange = () => {
    const ids = tasks.map(t => t.id);
    clearAnswersByIds(ids);
    setCorrectTaskIds([]);
  };

  if (!tasks || tasks.length === 0) {
    return <div>Нет вопросов</div>;
  }

  const taskIds = tasks.map((t) => t.id);
  const start = Math.min(...taskIds);
  const end = Math.max(...taskIds);

  return (
    <div className="task-container">
      <BackButton />

      <button
        onClick={goBack}
        className="back-link task-back-button"
      >
        ← Назад к выбору
      </button>

      <h1 className="task-heading">
        Урфин - задания {start}–{end}
      </h1>

      <ProgressBar correct={correctTaskIds.length} total={tasks.length} />

      <p>
        <strong>
          Правильных ответов: {correctTaskIds.length} из {tasks.length}
        </strong>
      </p>
      <hr />

      <div className="task-grid">
        {tasks.map((task) => (
          // <div className="task-item" key={`${task.id}_${correctTaskIds.length}`}>
          <div className="task-item" key={task.id}>  
            <Task
              task={task}
              onCorrect={handleCorrectAnswer}
              alreadyCorrect={correctTaskIds.includes(task.id)}
            />
          </div>
        ))}
      </div>

      <div className="reset-button-contaner">
        <button
          onClick={resetCurrentRange}
          className="reset-button"
        >
          Сбросить ответы на этой странице
        </button>
      </div>
    </div>
  );
}

export default TasksPage;

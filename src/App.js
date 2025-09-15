import './styles/styles.css';
import React, { useState, useEffect } from 'react';

import MenuPage from './components/MenuPage';
import TasksPageWrapper from './components/TasksPageWrapper';

function App() {
  const [allTasks, setAllTasks] = useState([]);
  const [currentPage, setCurrentPage] = useState('menu'); // 'menu' или 'tasks'
  const [selectedRange, setSelectedRange] = useState(null); // например, '1-10'

  // Загрузка JSON при старте
  useEffect(() => {
    fetch('/tasks_urfin.json')
      .then((res) => res.json())
      .then((data) => setAllTasks(data))
      .catch(console.error);
  }, []);

  // Функция перехода на страницу заданий
  const goToTasksPage = (range) => {
    setSelectedRange(range);
    setCurrentPage('tasks');
  };

  // Функция возврата в меню
  const goToMenuPage = () => {
    setCurrentPage('menu');
    setSelectedRange(null);
  };

  return (
    <>
      {currentPage === 'menu' && (
        <MenuPage allTasks={allTasks} onSelectRange={goToTasksPage} />
      )}
      {currentPage === 'tasks' && selectedRange && (
        <TasksPageWrapper
          allTasks={allTasks}
          selectedRange={selectedRange}
          goBack={goToMenuPage}
        />

      )}
    </>
  );
}

export default App;


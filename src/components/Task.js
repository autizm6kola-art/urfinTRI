
import React, { useEffect, useState } from "react";
import { 
  getSavedAnswer, 
  saveAnswerText, 
  saveCorrectAnswer, 
  isTaskCorrect 
} from '../utils/storage';
import '../styles/taskItem.css';

function Task({ task, onCorrect, resetSignal }) {
  // selectedAnswer: true/false/null
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  // При загрузке или сбросе - восстанавливаем сохранённые данные
  useEffect(() => {
    const saved = getSavedAnswer(task.id); // ожидаем saved = { answer: true/false, correct: true/false } или null
    if (saved) {
      setSelectedAnswer(saved.answer);
      setIsCorrect(saved.correct);
    } else {
      setSelectedAnswer(null);
      setIsCorrect(null);
    }
  }, [task.id, resetSignal]);

  const handleAnswer = (answer) => {
    if (isCorrect !== null) return; // уже отвечали, блокируем повторный ответ

    const correct = answer === task.correctAnswer;

    setSelectedAnswer(answer);
    setIsCorrect(correct);

    // Сохраняем ответ и статус в localStorage
    saveAnswerText(task.id, { answer, correct });

    if (correct) {
      saveCorrectAnswer(task.id);
      if (typeof onCorrect === 'function') {
        onCorrect(task.id);
      }
    }
  };

  return (
    <div className="task-item">
      <p><strong>Задача {task.id}</strong></p>

      {task.audio && (
        <audio controls src={process.env.PUBLIC_URL + task.audio} style={{ marginBottom: '10px' }} />
      )}

      <p>{task.text}</p>

      <div className="answer-buttons">
        <button
          onClick={() => handleAnswer(true)}
          disabled={isCorrect !== null}
          className={`answer-button ${
            selectedAnswer === true
              ? isCorrect ? 'correct' : 'incorrect'
              : ''
          }`}
        >
          Верно
        </button>

        <button
          onClick={() => handleAnswer(false)}
          disabled={isCorrect !== null}
          className={`answer-button ${
            selectedAnswer === false
              ? isCorrect ? 'correct' : 'incorrect'
              : ''
          }`}
        >
          Неверно
        </button>
      </div>
    </div>
  );
}

export default Task;

// // src/utils/storage.js

// import { supabase } from './supabaseClient';  // импорт клиента Supabase (предполагается, что он есть)

// const STORAGE_PREFIX = "app_audio_"; // можно поменять на любое название для конкретного приложения

// // Флаг: false — используем localStorage, true — Supabase
// const USE_SUPABASE = false;  // переключай на true, когда будешь готова к работе с Supabase

// // --- Реализация для localStorage ---

// const localStorageImpl = {
//   clearAllAnswers: () => {
//     const keys = Object.keys(localStorage);
//     keys.forEach((key) => {
//       if (key.startsWith(STORAGE_PREFIX)) {
//         localStorage.removeItem(key);
//       }
//     });
//   },

//   getTaskKey: (id) => `${STORAGE_PREFIX}task_answer_${id}`,

//   isTaskCorrect: (id) => {
//     return localStorage.getItem(localStorageImpl.getTaskKey(id)) === 'true';
//   },

//   saveCorrectAnswer: (id) => {
//     localStorage.setItem(localStorageImpl.getTaskKey(id), 'true');
//   },

//   migrateOldProgress: () => {
//     const keys = Object.keys(localStorage);
//     const oldProgressKeys = keys.filter(key => key.startsWith("progress_"));

//     oldProgressKeys.forEach((key) => {
//       try {
//         const data = JSON.parse(localStorage.getItem(key));
//         if (data && data.answeredTasks) {
//           Object.keys(data.answeredTasks).forEach((taskId) => {
//             localStorageImpl.saveCorrectAnswer(taskId);
//           });
//         }
//         // Можно оставить старые ключи, как ты делала
//       } catch (e) {
//         console.error("Ошибка при миграции из", key, e);
//       }
//     });
//   },

//   clearAnswersByIds: (ids) => {
//     ids.forEach((id) => {
//       localStorage.removeItem(localStorageImpl.getTaskKey(id));
//     });
//   },
// };

// // --- Реализация для Supabase ---

// const supabaseImpl = {
//   clearAllAnswers: async (userId) => {
//     const { error } = await supabase
//       .from('answers')
//       .delete()
//       .eq('user_id', userId);
//     if (error) console.error('Ошибка очистки ответов в Supabase:', error);
//   },

//   isTaskCorrect: async (id, userId) => {
//     const { data, error } = await supabase
//       .from('answers')
//       .select('answer_correct')
//       .eq('user_id', userId)
//       .eq('task_id', id)
//       .single();
//     if (error) {
//       console.error('Ошибка получения ответа из Supabase:', error);
//       return false;
//     }
//     return data?.answer_correct === true;
//   },

//   saveCorrectAnswer: async (id, userId) => {
//     const { error } = await supabase
//       .from('answers')
//       .upsert({ user_id: userId, task_id: id, answer_correct: true });
//     if (error) console.error('Ошибка сохранения ответа в Supabase:', error);
//   },

//   // Для миграции пока можно оставить пустую функцию или добавить логику
//   migrateOldProgress: () => {
//     // Тут пока ничего не делаем
//   },

//   clearAnswersByIds: async (ids, userId) => {
//     for (const id of ids) {
//       const { error } = await supabase
//         .from('answers')
//         .delete()
//         .eq('user_id', userId)
//         .eq('task_id', id);
//       if (error) console.error('Ошибка удаления ответа в Supabase:', error);
//     }
//   },
// };

// // --- Общий интерфейс — выбираем реализацию по флагу ---

// const storage = USE_SUPABASE ? supabaseImpl : localStorageImpl;

// // Экспортируем нужные функции

// export const clearAllAnswers = (userId) => storage.clearAllAnswers(userId);
// export const isTaskCorrect = (id, userId) => storage.isTaskCorrect(id, userId);
// export const saveCorrectAnswer = (id, userId) => storage.saveCorrectAnswer(id, userId);
// export const migrateOldProgress = (userId) => storage.migrateOldProgress(userId);
// export const clearAnswersByIds = (ids, userId) => storage.clearAnswersByIds(ids, userId);
// export const getTaskKey = localStorageImpl.getTaskKey;

import { supabase } from './supabaseClient';

const STORAGE_PREFIX = "app_audio_";
const USE_SUPABASE = false;

// === localStorage реализация ===

const localStorageImpl = {
  clearAllAnswers: () => {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  },

  getTaskKey: (id) => `${STORAGE_PREFIX}task_answer_${id}`,

  // Возвращает объект { answer: true/false, correct: true/false } или null
  getSavedAnswer: (id) => {
    const item = localStorage.getItem(localStorageImpl.getTaskKey(id));
    if (!item) return null;
    try {
      return JSON.parse(item);
    } catch {
      return null;
    }
  },

  // Сохраняет объект { answer, correct }
  saveAnswerText: (id, { answer, correct }) => {
    localStorage.setItem(localStorageImpl.getTaskKey(id), JSON.stringify({ answer, correct }));
  },

  isTaskCorrect: (id) => {
    const saved = localStorageImpl.getSavedAnswer(id);
    return saved?.correct === true;
  },

  saveCorrectAnswer: (id) => {
    // Просто помечаем, что задача решена верно
    // Можно не использовать, если есть saveAnswerText
    localStorage.setItem(localStorageImpl.getTaskKey(id), JSON.stringify({ answer: true, correct: true }));
  },

  migrateOldProgress: () => {
    const keys = Object.keys(localStorage);
    const oldProgressKeys = keys.filter(key => key.startsWith("progress_"));

    oldProgressKeys.forEach(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        if (data && data.answeredTasks) {
          Object.keys(data.answeredTasks).forEach(taskId => {
            localStorageImpl.saveCorrectAnswer(taskId);
          });
        }
      } catch (e) {
        console.error("Ошибка при миграции из", key, e);
      }
    });
  },

  clearAnswersByIds: (ids) => {
    ids.forEach(id => {
      localStorage.removeItem(localStorageImpl.getTaskKey(id));
    });
  },
};

// === Supabase реализация ===

const supabaseImpl = {
  clearAllAnswers: async (userId) => {
    const { error } = await supabase
      .from('answers')
      .delete()
      .eq('user_id', userId);
    if (error) console.error('Ошибка очистки ответов в Supabase:', error);
  },

  getSavedAnswer: async (id, userId) => {
    const { data, error } = await supabase
      .from('answers')
      .select('answer, answer_correct')
      .eq('user_id', userId)
      .eq('task_id', id)
      .single();

    if (error) {
      console.error('Ошибка получения ответа из Supabase:', error);
      return null;
    }

    if (!data) return null;

    return {
      answer: data.answer === true,
      correct: data.answer_correct === true,
    };
  },

  saveAnswerText: async (id, { answer, correct }, userId) => {
    const { error } = await supabase
      .from('answers')
      .upsert({ user_id: userId, task_id: id, answer: !!answer, answer_correct: !!correct });
    if (error) console.error('Ошибка сохранения ответа в Supabase:', error);
  },

  isTaskCorrect: async (id, userId) => {
    const saved = await supabaseImpl.getSavedAnswer(id, userId);
    return saved?.correct === true;
  },

  saveCorrectAnswer: async (id, userId) => {
    // Можно просто вызвать saveAnswerText с correct=true и answer=true
    await supabaseImpl.saveAnswerText(id, { answer: true, correct: true }, userId);
  },

  migrateOldProgress: () => {
    // Пока пусто
  },

  clearAnswersByIds: async (ids, userId) => {
    for (const id of ids) {
      const { error } = await supabase
        .from('answers')
        .delete()
        .eq('user_id', userId)
        .eq('task_id', id);
      if (error) console.error('Ошибка удаления ответа в Supabase:', error);
    }
  },
};

// === Общий интерфейс ===

const storage = USE_SUPABASE ? supabaseImpl : localStorageImpl;

// Функции возвращают промис или синхронный результат в зависимости от реализации.
// Для унификации можно всегда делать обёртку async/await, если хочешь.

export const clearAllAnswers = (userId) => storage.clearAllAnswers(userId);
export const getSavedAnswer = (id, userId) => storage.getSavedAnswer(id, userId);
export const saveAnswerText = (id, answerObj, userId) => storage.saveAnswerText(id, answerObj, userId);
export const isTaskCorrect = (id, userId) => storage.isTaskCorrect(id, userId);
export const saveCorrectAnswer = (id, userId) => storage.saveCorrectAnswer(id, userId);
export const migrateOldProgress = (userId) => storage.migrateOldProgress(userId);
export const clearAnswersByIds = (ids, userId) => storage.clearAnswersByIds(ids, userId);
export const getTaskKey = localStorageImpl.getTaskKey;

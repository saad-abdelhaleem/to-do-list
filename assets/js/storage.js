/**
 * storage.js
 *
 * Small wrapper around localStorage that knows nothing about the UI.
 * Its only job is to load/save the list of todos as plain JSON.
 */

const TodoStorage = (() => {
  const STORAGE_KEY = "todo-app:tasks";

  /**
   * Read all tasks from localStorage.
   * Returns an empty array if nothing was saved yet or the data is corrupted.
   */
  function getAll() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    try {
      const tasks = JSON.parse(raw);
      return Array.isArray(tasks) ? tasks : [];
    } catch (error) {
      console.error("Failed to parse todos from localStorage:", error);
      return [];
    }
  }

  /** Persist the full list of tasks to localStorage. */
  function saveAll(tasks) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }

  /** Generate a reasonably unique id for a new task. */
  function generateId() {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  return { getAll, saveAll, generateId };
})();

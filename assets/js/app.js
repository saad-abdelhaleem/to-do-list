/**
 * app.js
 *
 * Renders the todo list and wires up all user interactions:
 * add, toggle, edit, delete, search, "mark all" and "clear completed".
 *
 * Task shape stored in localStorage:
 *   { id: string, text: string, completed: boolean, deleted: boolean }
 *
 * Deleting a task is "soft" (deleted: true) instead of removing it from the
 * array, so the app can keep a running "Deleted" counter as requested.
 */

(() => {
  // ---------------------------------------------------------------------
  // DOM references
  // ---------------------------------------------------------------------

  const searchInput = document.getElementById("search-input");
  const newTodoForm = document.getElementById("new-todo-form");
  const newTodoInput = document.getElementById("new-todo-input");
  const toggleAllCheckbox = document.getElementById("toggle-all-checkbox");
  const todoListEl = document.getElementById("todo-list");
  const emptyStateEl = document.getElementById("empty-state");
  const itemsLeftEl = document.getElementById("items-left-count");
  const clearCompletedBtn = document.getElementById("clear-completed-btn");

  const totalCountEl = document.getElementById("total-count");
  const completedCountEl = document.getElementById("completed-count");
  const deletedCountEl = document.getElementById("deleted-count");

  // ---------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------

  let tasks = TodoStorage.getAll();
  let searchTerm = "";

  // ---------------------------------------------------------------------
  // Persistence helper
  // ---------------------------------------------------------------------

  function persist() {
    TodoStorage.saveAll(tasks);
  }

  // ---------------------------------------------------------------------
  // Derived helpers
  // ---------------------------------------------------------------------

  /** Tasks that have not been deleted (the ones the app normally works with). */
  function getActiveTasks() {
    return tasks.filter((task) => !task.deleted);
  }

  /** Active tasks that also match the current search term. */
  function getVisibleTasks() {
    const term = searchTerm.trim().toLowerCase();
    const activeTasks = getActiveTasks();

    if (!term) return activeTasks;

    return activeTasks.filter((task) => task.text.toLowerCase().includes(term));
  }

  // ---------------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------------

  function render() {
    renderTodoList();
    renderCounts();
    renderToggleAllState();
  }

  function renderTodoList() {
    const visibleTasks = getVisibleTasks();

    todoListEl.innerHTML = "";
    emptyStateEl.hidden = visibleTasks.length > 0;

    visibleTasks.forEach((task) => {
      todoListEl.appendChild(buildTodoItemElement(task));
    });
  }

  /** Build the <li> element for a single task. */
  function buildTodoItemElement(task) {
    const li = document.createElement("li");
    li.className = "todo-item" + (task.completed ? " todo-item--completed" : "");
    li.dataset.id = task.id;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "todo-item__checkbox";
    checkbox.checked = task.completed;
    checkbox.addEventListener("change", () => toggleTaskCompleted(task.id));

    const label = document.createElement("span");
    label.className = "todo-item__label";
    label.textContent = task.text;
    label.addEventListener("dblclick", () => startEditingTask(li, task));

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "todo-item__delete-btn";
    deleteBtn.textContent = "×"; // multiplication sign, used as an "x" icon
    deleteBtn.setAttribute("aria-label", "Delete task");
    deleteBtn.addEventListener("click", () => deleteTask(task.id));

    li.append(checkbox, label, deleteBtn);
    return li;
  }

  function renderCounts() {
    const activeTasks = getActiveTasks();
    const completedTasks = activeTasks.filter((task) => task.completed);
    const deletedTasks = tasks.filter((task) => task.deleted);

    const itemsLeft = activeTasks.length - completedTasks.length;
    itemsLeftEl.textContent = `${itemsLeft} item${itemsLeft === 1 ? "" : "s"} left`;
    clearCompletedBtn.textContent = `Clear ${completedTasks.length} completed item${
      completedTasks.length === 1 ? "" : "s"
    }`;

    totalCountEl.textContent = activeTasks.length;
    completedCountEl.textContent = completedTasks.length;
    deletedCountEl.textContent = deletedTasks.length;
  }

  /** Keep the "mark all as complete" checkbox in sync with the task list. */
  function renderToggleAllState() {
    const activeTasks = getActiveTasks();
    toggleAllCheckbox.checked =
      activeTasks.length > 0 && activeTasks.every((task) => task.completed);
  }

  // ---------------------------------------------------------------------
  // Task operations
  // ---------------------------------------------------------------------

  function addTask(text) {
    const trimmedText = text.trim();
    if (!trimmedText) return;

    tasks.push({
      id: TodoStorage.generateId(),
      text: trimmedText,
      completed: false,
      deleted: false,
    });

    persist();
    render();
  }

  function toggleTaskCompleted(id) {
    const task = tasks.find((task) => task.id === id);
    if (!task) return;

    task.completed = !task.completed;
    persist();
    render();
  }

  function deleteTask(id) {
    const task = tasks.find((task) => task.id === id);
    if (!task) return;

    task.deleted = true;
    persist();
    render();
  }

  function renameTask(id, newText) {
    const trimmedText = newText.trim();
    const task = tasks.find((task) => task.id === id);
    if (!task) return;

    // An edit that results in an empty string removes the task.
    if (!trimmedText) {
      deleteTask(id);
      return;
    }

    task.text = trimmedText;
    persist();
    render();
  }

  function setAllCompleted(completed) {
    getActiveTasks().forEach((task) => {
      task.completed = completed;
    });

    persist();
    render();
  }

  function clearCompletedTasks() {
    getActiveTasks()
      .filter((task) => task.completed)
      .forEach((task) => {
        task.deleted = true;
      });

    persist();
    render();
  }

  // ---------------------------------------------------------------------
  // Inline editing (double-click a label to rename a task)
  // ---------------------------------------------------------------------

  function startEditingTask(listItemEl, task) {
    const label = listItemEl.querySelector(".todo-item__label");

    const editInput = document.createElement("input");
    editInput.type = "text";
    editInput.className = "todo-item__edit-input";
    editInput.value = task.text;

    label.replaceWith(editInput);
    editInput.focus();
    editInput.select();

    let isFinished = false;

    const finishEditing = (shouldSave) => {
      if (isFinished) return;
      isFinished = true;

      if (shouldSave) {
        renameTask(task.id, editInput.value);
      } else {
        render(); // discard changes, just redraw the original label
      }
    };

    editInput.addEventListener("blur", () => finishEditing(true));

    editInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        editInput.blur();
      } else if (event.key === "Escape") {
        isFinished = true; // skip the upcoming blur save
        render();
      }
    });
  }

  // ---------------------------------------------------------------------
  // Event wiring
  // ---------------------------------------------------------------------

  newTodoForm.addEventListener("submit", (event) => {
    event.preventDefault();
    addTask(newTodoInput.value);
    newTodoInput.value = "";
  });

  toggleAllCheckbox.addEventListener("change", () => {
    setAllCompleted(toggleAllCheckbox.checked);
  });

  clearCompletedBtn.addEventListener("click", clearCompletedTasks);

  searchInput.addEventListener("input", () => {
    searchTerm = searchInput.value;
    renderTodoList();
  });

  // ---------------------------------------------------------------------
  // Initial render
  // ---------------------------------------------------------------------

  render();
})();

# To-Do List

A simple, no-framework to-do list app built with plain HTML, CSS, and JavaScript.

**Live demo:** https://to-do-list-five-gilt-45.vercel.app

## Features

- Add, rename (double-click to edit), complete, and delete tasks
- Search/filter tasks by text
- Mark all tasks as complete/incomplete in one click
- Clear all completed tasks
- Live counters for total, completed, and deleted tasks
- Tasks persist across page reloads via `localStorage`

## Tech / Code structure

No build tools, no frameworks, no dependencies — just static files:

- **[index.html](index.html)** — the page markup/structure only; no inline logic.
- **[assets/css/style.css](assets/css/style.css)** — all styling.
- **[assets/js/storage.js](assets/js/storage.js)** — a small `TodoStorage` module (IIFE) that wraps `localStorage`. It only knows how to read/write the task array as JSON and generate IDs; it has no knowledge of the DOM or UI.
- **[assets/js/app.js](assets/js/app.js)** — the app logic, also wrapped in an IIFE to avoid polluting the global scope. It holds the in-memory `tasks` array, renders the list to the DOM, and wires up all event listeners (add, toggle, edit, delete, search, toggle-all, clear-completed).

Each task is stored as a plain object:

```js
{ id: string, text: string, completed: boolean, deleted: boolean }
```

Deleting a task is a "soft delete" (`deleted: true` instead of removing it from the array), which is what allows the app to keep a running "Deleted" counter. Every mutation goes through a single `persist()` call that saves the whole array back to `localStorage`, followed by a `render()` call that re-draws the list and counters from the current state.

## Running locally

Just open [index.html](index.html) in a browser — no server or build step required.

## Deployment

Deployed on [Vercel](https://vercel.com) as a static site.

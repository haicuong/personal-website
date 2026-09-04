---
title: "Task Manager V2"
date: "2026-09-03"
description: "A zero-framework task manager built with strict TypeScript, ES modules, and custom event handling."
techStack: ["HTML", "TailwindCSS", "Typescript", "Vite"]
repoUrl: "https://github.com/haicuong/task-manager"
liveUrl: ""
coverImage: "/images/projects/task-manager/cover.jpg"
---

# Task Manager

A modern, lightweight task management web application built with TypeScript, Vite and Tailwind CSS. Organize your tasks efficiently with a clean, dark-themed interface.

🔴 Live demo: [task-manager.haicuong.me](https://task-manager.haicuong.me/)\
💻 Source code: [task-manager](https://github.com/haicuong/task-manager).

## Features

✨ **Core Functionality**

- 📋 Create and manage task tables
- ✍️ Add tasks with a name, description, priority, due date, and status
- ✅ Mark tasks as complete or incomplete
- 🔍 Filter tasks by status
- 📊 Sort tasks by name or date
- 🗑️ Delete individual tasks or entire tables
- 💾 Save tables and tasks automatically in browser local storage
- 📱 Responsive desktop and mobile interactions
- 🌙 Dark-themed interface

## Usage

### Create a Table

1. Enter a table name.
2. Add table.

### Add a Task

1. Select **Add Task** in a table.
2. Enter the task name and description.
3. Select a priority: Low, Medium, or High.
4. Select a due date.
5. Select **Submit**.

### Manage Tasks

- Select a task status to mark it complete or incomplete.
- Select the status filter to cycle through None, Incomplete, and Complete.
- Select the **Name** column to sort by name.
- Select the **Date** column to sort by date.
- Select outside an open popup to close it.

### Desktop Behavior

Desktop interactions use a mouse:

- Hover over a task name to see its description.
- Hover over a task date to see the full date and time.
- Right-click a task to open the task deletion box.
- Right-click a table caption to open the table deletion box.
- Select the delete button in a deletion box to confirm deletion.

### Mobile Behavior

Mobile interactions use touch:

- Click a task to open the task deletion box.
- Click a task name to see its full description.
- Click a task date to see the full date and time.
- Click a table caption to open the table deletion box.
- Select the delete button in a deletion box to confirm deletion.
- Click outside an open popup to close it.

### Data Persistence

Tables and tasks are automatically saved in browser local storage. Saved data is restored when the application is opened again in the same browser.

## Tech Stack

- TypeScript
- Vite
- Tailwind CSS v4
- ESLint
- TypeScript ESLint

## Project Structure

```text
task-manager/
├── script/
│   ├── add-table-button.ts       # Add-table form and table creation
│   ├── add-task.ts               # Add-task form and task creation
│   ├── async-storage.ts          # Browser storage helpers
│   ├── custom-errors.ts          # Custom application errors
│   ├── delete-boxes-event.ts     # Task and table deletion interactions
│   ├── event-manager.ts          # Shared events and DOM utilities
│   ├── initial-status-filter.ts  # Task status filtering
│   ├── initial-table-sorting.ts  # Table sorting
│   ├── initial-table.ts          # Table and task data models
│   ├── main.ts                   # Application entry point
│   └── tooltip-event.ts          # Desktop and mobile tooltip interactions
├── public/
│   └── images/        # Public image assets
├── assets/            # Project asset directory
├── eslint.config.ts   # ESLint configuration
├── index.html         # HTML entry point
├── package.json       # Project metadata and scripts
├── package-lock.json  # Locked dependency versions
├── styles.css         # Global styles and Tailwind import
├── tsconfig.json      # TypeScript configuration
└── vite.config.ts     # Vite configuration
```

## Development

### Requirements

- Node.js 18 or newer
- npm

### Install Dependencies

Clone the repository, move into the project directory, and install the dependencies:

```bash
git clone https://github.com/haicuong/task-manager.git
cd task-manager
npm install
```

### Development Server

Start the Vite development server:

```bash
npm run dev
```

Open the local URL shown in the terminal. The default URL is usually `http://localhost:5173`.

### Production Build

Type-check the project and create a production build:

```bash
npm run build
```

### Preview the Production Build

Serve the production build locally:

```bash
npm run preview
```

## Code Quality

The project uses ESLint and TypeScript to maintain consistent code quality and catch type errors during development.

## Architecture

The application follows a modular architecture:

- **Table Management**: Core table logic handles task storage and rendering
- **Event System**: Centralized event manager handles user interactions
- **Storage Layer**: Async storage provides persistent data management
- **UI Components**: Separate modules handle different features such as filtering and sorting

## Future Enhancements (Not planned)

Potential improvements:

- User authentication and cloud sync
- Task categories and tags
- Recurring tasks
- Task notifications
- Export/import functionality
- Collaborative task sharing

## Support

For issues or questions, please contact the project maintainer.

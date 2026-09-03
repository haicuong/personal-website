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

A modern, lightweight task management web application built with TypeScript and Vite. Organize your tasks efficiently with a clean, dark-themed interface.

Live demo: ***Updating...***\
Source code: [task-manager](https://github.com/haicuong/task-manager).

## Features

✨ **Core Functionality**

- ✅ Create and manage tasks with detailed information
- 🗑️ Delete individual tasks or entire task tables
- 🎯 Set task priorities (Low, Medium, High)
- 📅 Assign due dates to tasks
- 💾 Persistent storage with automatic local data management
- 🔍 Filter tasks by status
- 📊 Sort tasks in the table
- 🌙 Dark-themed UI for comfortable viewing

## Tech Stack

- **Frontend Framework**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **Code Quality**: ESLint + TypeScript ESLint
- **Type Checking**: TypeScript 6.0

## Project Structure

```
task-manager/
├── script/                   # TypeScript source files
│   ├── main.ts               # Application entry point
│   ├── initial-table.ts      # Table initialization and management
│   ├── add-task.ts           # Add task functionality
│   ├── delete-boxes-event.ts # Delete task/table handlers
│   ├── event-manager.ts      # Event handling and DOM utilities
│   ├── initial-status-filter.ts  # Status filtering logic
│   ├── initial-table-sorting.ts  # Table sorting functionality
│   ├── async-storage.ts      # Local storage management
│   ├── custom-errors.ts      # Custom error definitions
│   ├── tooltip-event.ts      # Tooltip interactions
│   └── add-table-button.ts   # Add table button logic
├── index.html                # HTML entry point
├── styles.css                # Global styles
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite configuration
├── eslint.config.ts          # ESLint configuration
└── assets/                   # Static assets
    └── images/
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Quick Start

1. Clone and install:

   ```bash
   git clone https://github.com/haicuong/task-manager.git
   cd task-manager
   npm install
   ```

2. Start development server:

   ```bash
   npm run dev
   ```

3. Open `http://localhost:5173` in your browser

## Usage

### Adding a Task

1. Click the "Add Task" button
2. Fill in the task details:
   - **Task name**: A brief title for your task
   - **Description**: Additional details about the task
   - **Priority**: Select from Low, Medium, or High
   - **Date**: Choose a due date
3. Click Submit to add the task

### Managing Tasks

- **Change Status**: Click on a task status to update its status
- **Sort Tasks**: Click on table column headers to sort
- **Filter by Status**: Use the status filter to view specific tasks
- **Delete Task**: Right click on tasks to open delete box
- **Delete Table**: Right click on table title to open delete box

### Data Persistence

All tasks are automatically saved to local storage, ensuring your data persists between sessions.

## Code Quality

This project uses ESLint with TypeScript support to maintain code quality. The linting configuration is strict to ensure consistent, maintainable code.

## Architecture

The application follows a modular architecture:

- **Table Management**: Core table logic handles task storage and rendering
- **Event System**: Centralized event manager handles user interactions
- **Storage Layer**: Async storage provides persistent data management
- **UI Components**: Separate modules handle different UI features (filters, sorting, etc.)

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

---

**Last Updated**: 2026
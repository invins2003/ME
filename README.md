# Ambit.dev | Developer Portfolio

A high-performance, automated portfolio website designed with a modern "tech" aesthetic. This project features real-time data synchronization, advanced UX components, and a hidden interactive game.

## 🚀 Key Features

### 1. Automated Data Sync
- **Google Drive Integration**: Your resume data is automatically pulled from a Google Doc using a custom python script (`sync_drive.py`).
- **Gemini 1.5 Pro Power**: The raw content is parsed and structured using the official Google GenAI SDK to ensure a polished professional layout.
- **GitHub Sync**: Fetching latest repository data and project metadata directly.

### 2. Premium UX Components
- **Custom Interactive Cursor**: A cyan-ring cursor that scales and glows on hover, providing high-end visual feedback.
- **Command Palette (Ctrl + K)**: A Raycast/Spotlight-style searchable menu for instant navigation to any section, project, or social link.
- **"Hire Me" Quick-Action Modal**: A minimalist modal designed for rapid conversion—providing direct contact links with zero friction.

### 3. "Bug Invaders" - Hidden Retro Game
- **What it is**: A terminal-themed Space Invaders clone.
- **How to Launch**: Open the Command Palette (`Ctrl + K`) and type **"game"** or **"invaders"**.
- **Gameplay**: Move with **Arrow Keys** and fire "Code Fixes" with **Space** to clear production-breaking bugs.

## 🎨 Design Aesthetic
- **Glassmorphism**: Advanced blur effects and semi-transparent layers.
- **Matrix Background**: A custom HTML5 Canvas animation with interactive nodes that react to mouse movement.
- **Fira Code Typography**: Emphasizing the technical nature of the content with a high-readability monospaced font.
- **Custom Branding**: A high-end cyan terminal favicon and meta icon for better SEO and professional presence.

## 🛠️ Technology Stack
- **Frontend**: Vanilla HTML5, CSS3 (Modern variables & Flex/Grid), and Vanilla JavaScript (ES6+).
- **Automation**: Python (for data extraction), GitHub Actions (for CI/CD).
- **AI**: Gemini 1.5 Pro (for content structuring).

## 📂 Project Structure
```text
├── index.html       # Main portfolio structure & modals
├── style.css       # Design system, glassmorphism, & animations
├── app.js          # UX logic, Command Palette, & Game Engine
├── constants.js    # Data repository (auto-updated by sync)
└── sync_drive.py   # Python automation script
```

## ⌨️ Shortcuts
- **`Ctrl + K`**: Toggle Command Palette
- **`Esc`**: Close any active modal or game
- **`Arrows` / `Space`**: In-game controls

---
Crafted with Precision by Ambit Misra

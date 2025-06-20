<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Tauri Amortization Calculator Project

## Project Overview
This is a modern desktop amortization calculator built with:
- **Frontend**: HTML5, CSS3, Vanilla JavaScript, Chart.js
- **Backend**: Rust with Tauri framework
- **Architecture**: Web-based UI with native Rust backend

## Key Technologies
- **Tauri 1.5**: Desktop app framework
- **Rust**: Safe, fast backend calculations
- **Chart.js**: Interactive data visualization
- **Modern CSS**: Grid layouts, animations, responsive design
- **Vite**: Fast development and building

## Code Style Guidelines
- Use modern JavaScript (ES6+) features
- Follow Rust best practices for backend code
- Use semantic HTML5 elements
- Implement responsive CSS design patterns
- Prefer async/await over Promises where applicable

## Development Focus
- Performance optimization for large payment schedules
- Accessibility compliance (WCAG guidelines)
- Cross-platform compatibility (Windows, macOS, Linux)
- Modern UX/UI design patterns
- Secure data handling between frontend and backend

## Tauri-Specific Instructions
- Always use `invoke()` for frontend-backend communication
- Handle errors gracefully with proper user feedback
- Use Tauri's security features and CSP policies
- Follow Tauri's command pattern for backend functions
- Implement proper serialization with serde for data structures

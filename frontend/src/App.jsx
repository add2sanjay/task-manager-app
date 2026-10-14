import TasksPage from './features/tasks/TasksPage'
import ThemeSwitcher from './features/theme/ThemeSwitcher'

export default function App() {
  return (
    <div className="container">
      <header className="header">
        <h1>Task Manager</h1>
        <ThemeSwitcher />
      </header>
      <TasksPage />
    </div>
  )
}

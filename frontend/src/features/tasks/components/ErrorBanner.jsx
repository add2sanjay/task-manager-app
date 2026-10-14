export default function ErrorBanner({ message, onDismiss }) {
  if (!message) return null

  return (
    <div className="error">
      <span>{message}</span>
      <button onClick={onDismiss}>✕</button>
    </div>
  )
}

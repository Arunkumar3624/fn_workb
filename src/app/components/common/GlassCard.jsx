export function GlassCard({ children, className = "" }) {
  return <div className={`wb-glass-card ${className}`.trim()}>{children}</div>;
}

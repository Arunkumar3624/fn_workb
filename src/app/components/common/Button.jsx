export function Button({ children, variant = "primary", className = "", ...props }) {
  return (
    <button className={`wb-button wb-button--${variant} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}

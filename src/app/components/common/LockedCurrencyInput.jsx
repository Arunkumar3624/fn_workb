export default function LockedCurrencyInput({
  value,
  onChange,
  className = "",
  inputClassName = "",
  ...props
}) {
  return (
    <div className={`relative flex items-center ${className}`}>
      <span className="absolute left-3 text-slate-400 font-medium select-none pointer-events-none">
        ₹
      </span>
      <input
        {...props}
        type="number"
        min="0"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${inputClassName} pl-8`}
      />
    </div>
  );
}

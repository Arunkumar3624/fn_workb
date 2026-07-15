export default function Avatar({
  initials,
  bg = "bg-[#1B3FAB]",
  size = "w-12 h-12",
  text = "text-sm",
}) {
  return (
    <div className={`${size} ${bg} rounded-xl flex items-center justify-center text-white font-bold ${text} flex-shrink-0`}>
      {initials}
    </div>
  );
}

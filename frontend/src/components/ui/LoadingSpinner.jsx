export default function LoadingSpinner({
  size = "md",
  text = "Loading...",
}) {
  const sizes = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-4",
    lg: "h-12 w-12 border-4",
  };

  return (
    <div className="flex items-center justify-center gap-3 p-6">
      <div
        className={`animate-spin rounded-full border-gray-300 border-t-blue-600 ${sizes[size]}`}
        aria-label="Loading"
      />

      {text && (
        <span className="text-sm text-gray-600">
          {text}
        </span>
      )}
    </div>
  );
}
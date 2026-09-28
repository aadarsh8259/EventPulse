export default function Toast({
  message,
  type = "success",
  onClose,
}) {
  const styles = {
    success: "border-green-200",
    error: "border-red-200",
    warning: "border-yellow-200",
    info: "border-blue-200",
  };

  return (
    <div
      className={`rounded-lg border bg-white p-4 shadow-lg ${
        styles[type] || styles.info
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm text-gray-800">{message}</p>

        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-700"
          aria-label="Close notification"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
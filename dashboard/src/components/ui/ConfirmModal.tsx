import { X, AlertCircle } from "lucide-react";
import { useEscapeKey } from "../../hooks/useEscapeKey";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = true,
}: ConfirmModalProps) {
  useEscapeKey(onCancel, isOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${isDestructive ? 'bg-red-100' : 'bg-orange-100'}`}>
              <AlertCircle className={`h-5 w-5 ${isDestructive ? 'text-red-600' : 'text-orange-600'}`} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-600">{message}</p>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
              isDestructive ? "bg-red-600 hover:bg-red-700" : "bg-orange-600 hover:bg-orange-700"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

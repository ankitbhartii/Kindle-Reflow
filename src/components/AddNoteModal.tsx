import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

interface AddNoteModalProps {
  isOpen: boolean;
  selectedText: string;
  onSave: (note: string) => void;
  onClose: () => void;
}

export const AddNoteModal: React.FC<AddNoteModalProps> = ({
  isOpen,
  selectedText,
  onSave,
  onClose,
}) => {
  const [noteText, setNoteText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (noteText.trim()) {
      onSave(noteText.trim());
      setNoteText('');
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-(--bg-surface) text-(--text-primary) border border-(--border-color) rounded-2xl shadow-2xl p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-2 border-b border-(--border-color)">
          <h3 className="font-semibold text-sm">Add Note</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-(--bg-subtle) text-(--text-secondary) transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 rounded-xl bg-(--bg-subtle)/50 border border-(--border-color)/50 text-xs italic text-(--text-secondary) line-clamp-3">
          "{selectedText}"
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            autoFocus
            rows={3}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Type your thought, note, or annotation..."
            className="w-full p-3 text-xs sm:text-sm bg-(--bg-surface) border border-(--border-color) rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-(--text-primary) resize-none"
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-xl border border-(--border-color) hover:bg-(--bg-subtle) text-(--text-secondary) transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!noteText.trim()}
              className="px-4 py-2 text-xs font-medium rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Note</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

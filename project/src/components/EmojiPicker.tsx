import { Smile } from 'lucide-react';
import { useState } from 'react';

interface EmojiPickerProps {
  suggestions: Array<{ emoji: string; reason: string }>;
  selectedEmoji?: string;
  onSelect: (emoji: string) => void;
  onClear: () => void;
}

export default function EmojiPicker({
  suggestions,
  selectedEmoji,
  onSelect,
  onClear
}: EmojiPickerProps) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowPicker(!showPicker)}
        className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all text-sm"
      >
        <Smile className="w-4 h-4" />
        {selectedEmoji ? (
          <span className="text-lg">{selectedEmoji}</span>
        ) : (
          <span>Add Emoji</span>
        )}
      </button>

      {showPicker && (
        <div className="absolute top-full mt-2 left-0 bg-white rounded-lg shadow-xl border-2 border-slate-200 p-4 z-50 min-w-[280px]">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-slate-800 text-sm">
              Suggested Emojis
            </h4>
            <button
              onClick={() => setShowPicker(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>

          <div className="space-y-2">
            {suggestions.map(({ emoji, reason }) => (
              <button
                key={emoji}
                onClick={() => {
                  onSelect(emoji);
                  setShowPicker(false);
                }}
                className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all ${
                  selectedEmoji === emoji
                    ? 'bg-blue-100 border-2 border-blue-500'
                    : 'bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <span className="text-2xl">{emoji}</span>
                <span className="text-xs text-slate-600 text-left">{reason}</span>
              </button>
            ))}
          </div>

          {selectedEmoji && (
            <button
              onClick={() => {
                onClear();
                setShowPicker(false);
              }}
              className="w-full mt-3 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all text-sm"
            >
              Remove Emoji
            </button>
          )}
        </div>
      )}
    </div>
  );
}

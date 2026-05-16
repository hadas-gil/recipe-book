'use client';

const CATEGORIES = [
  { id: 'all', label: 'הכל', emoji: '🍽️' },
  { id: 'salads', label: 'סלטים', emoji: '🥗' },
  { id: 'starters', label: 'ראשונות', emoji: '🥣' },
  { id: 'mains', label: 'עיקריות', emoji: '🍖' },
  { id: 'desserts', label: 'קינוחים', emoji: '🍰' },
  { id: 'favorites', label: 'מועדפים', emoji: '⭐' },
];

export { CATEGORIES };

export default function CategoryGrid({ active, onChange, counts = {} }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
      {CATEGORIES.map(cat => {
        const count = cat.id === 'all'
          ? Object.values(counts).reduce((a, b) => a + b, 0)
          : counts[cat.id] || 0;
        const isActive = active === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onChange(cat.id)}
            className={`flex-shrink-0 flex flex-col items-center gap-1 px-4 py-2 rounded-2xl text-sm font-semibold transition-all duration-150
              ${isActive
                ? 'bg-brand-500 text-white shadow-md scale-105'
                : 'bg-white text-gray-600 border border-gray-200'
              }`}
          >
            <span className="text-xl">{cat.emoji}</span>
            <span>{cat.label}</span>
            {count > 0 && (
              <span className={`text-xs font-normal ${isActive ? 'text-orange-100' : 'text-gray-400'}`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

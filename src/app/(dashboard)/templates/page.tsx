'use client';

const TEMPLATES = [
  { name: 'Coquette Pink Room', type: 'pink_bedroom', colors: ['#f8bbd0', '#f06292', '#ec407a'], desc: 'Romantic pink aesthetic dengan sentuhan fairy lights' },
  { name: 'Minimal Korea Room', type: 'korea_minimal', colors: ['#f5f5f5', '#e0e0e0', '#bdbdbd'], desc: 'Clean white & wood Korean-style interior' },
  { name: 'Pinterest Bedroom', type: 'pinterest_bedroom', colors: ['#ffe0b2', '#ffab91', '#a5d6a7'], desc: 'Warm sunset tone dengan tanaman hias' },
  { name: 'Study Desk Aesthetic', type: 'study_desk', colors: ['#d7ccc8', '#a1887f', '#8d6e63'], desc: 'Meja kayu aesthetic dengan monitor & buku' },
  { name: 'Warm Bedroom', type: 'warm_bedroom', colors: ['#ffcc80', '#ffb74d', '#fff9c4'], desc: 'Lampu kuning hangat, selimut cream, homey' },
];

const EMOJIS = ['P', 'G', 'R', 'B', 'L'];

export default function TemplatesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Template</h1>
        <p className="text-white/40 mt-1">Pilih mockup room untuk video marketing kamu</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {TEMPLATES.map((tpl, i) => (
          <div
            key={tpl.name}
            className="glass-card rounded-2xl overflow-hidden group cursor-pointer"
          >
            {/* Preview */}
            <div
              className="h-44 flex items-center justify-center relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${tpl.colors[0]}33, ${tpl.colors[1]}22, ${tpl.colors[2]}33)`,
              }}
            >
              <div
                className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-500"
                style={{
                  background: `radial-gradient(circle at 30% 40%, ${tpl.colors[0]}88, transparent 60%), radial-gradient(circle at 70% 60%, ${tpl.colors[2]}88, transparent 60%)`,
                }}
              />
              <span className="text-5xl relative z-0 group-hover:scale-110 transition-transform duration-500">
                {EMOJIS[i]}
              </span>
              <div className="absolute bottom-3 left-3 flex gap-1.5">
                {tpl.colors.map((c, ci) => (
                  <span
                    key={ci}
                    className="w-2.5 h-2.5 rounded-full border border-white/20 shadow-lg"
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              <h3 className="font-semibold group-hover:text-white transition-colors">{tpl.name}</h3>
              <p className="text-xs text-white/30 mt-0.5 capitalize">{tpl.type.replace(/_/g, ' ')}</p>
              <p className="text-xs text-white/20 mt-2 leading-relaxed">{tpl.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

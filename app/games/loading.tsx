export default function GamesLoading() {
  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white px-6 pt-8 pb-6">
        <div className="h-8 w-32 bg-slate-700 rounded mb-2" />
        <div className="h-4 w-48 bg-slate-700 rounded" />
      </div>
      <div className="px-4 py-6 space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-3">
            <div className="h-6 w-24 bg-slate-200 rounded" />
            {[1, 2, 3].map((j) => (
              <div
                key={j}
                className="h-32 bg-slate-100 rounded-lg border-l-4 border-l-slate-200"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

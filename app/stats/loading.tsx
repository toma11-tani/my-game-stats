export default function StatsLoading() {
  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white px-6 pt-8 pb-6">
        <div className="h-8 w-32 bg-slate-700 rounded mb-2" />
        <div className="h-4 w-48 bg-slate-700 rounded" />
      </div>
      <div className="px-4 py-6 space-y-6">
        <div className="h-32 bg-slate-100 rounded-lg" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-48 bg-slate-100 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}

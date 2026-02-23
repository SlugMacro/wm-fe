function InfoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.2" />
      <path d="M8 7V11M8 5V5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export default function SettlementBanners() {
  return (
    <div className="flex gap-4">
      {/* Upcoming Settlements */}
      <div className="flex-1 relative overflow-hidden rounded-lg border border-[rgba(59,130,246,0.15)] bg-[rgba(59,130,246,0.06)] px-5 py-4">
        <div className="relative z-10">
          <h3 className="text-sm font-medium text-[#b4b4ba] mb-2">Upcoming Settlements</h3>
          <div className="flex items-center gap-2 text-[#7a7a83]">
            <InfoIcon />
            <span className="text-sm">No markets in upcoming settlements</span>
          </div>
        </div>
        {/* Decorative gradient */}
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-[rgba(59,130,246,0.08)] to-transparent" />
      </div>

      {/* Current Settlements */}
      <div className="flex-1 relative overflow-hidden rounded-lg border border-[rgba(22,194,132,0.15)] bg-[rgba(22,194,132,0.06)] px-5 py-4">
        <div className="relative z-10">
          <h3 className="text-sm font-medium text-[#b4b4ba] mb-2">Current Settlements</h3>
          <div className="flex items-center gap-2 text-[#7a7a83]">
            <InfoIcon />
            <span className="text-sm">No markets in current settlements</span>
          </div>
        </div>
        {/* Decorative gradient */}
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-[rgba(22,194,132,0.08)] to-transparent" />
      </div>
    </div>
  );
}

import { ExternalLink } from 'lucide-react';

export default function BottomStats() {
  return (
    <div className="flex items-center justify-between border-t border-[#1b1b1c] py-3">
      {/* Left - Live data */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="size-2 rounded-full bg-[#16c284] animate-pulse" />
          <span className="text-xs font-medium uppercase text-[#7a7a83]">Live Data</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-normal text-[#7a7a83]">Total Vol</span>
          <span className="text-xs font-medium text-[#f9f9fa] tabular-nums">$5,375,032.81</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-normal text-[#7a7a83]">Vol 24h</span>
          <span className="text-xs font-medium text-[#f9f9fa] tabular-nums">$832,750.55</span>
        </div>
      </div>

      {/* Right - Links */}
      <div className="flex items-center gap-4">
        <a
          href="#"
          className="flex items-center gap-1 text-xs font-normal text-[#7a7a83] transition-colors hover:text-[#f9f9fa]"
          onClick={(e) => e.preventDefault()}
        >
          Docs <ExternalLink size={10} />
        </a>
        <a
          href="#"
          className="flex items-center gap-1 text-xs font-normal text-[#7a7a83] transition-colors hover:text-[#f9f9fa]"
          onClick={(e) => e.preventDefault()}
        >
          Dune <ExternalLink size={10} />
        </a>
        <a
          href="#"
          className="flex items-center gap-1 text-xs font-normal text-[#7a7a83] transition-colors hover:text-[#f9f9fa]"
          onClick={(e) => e.preventDefault()}
        >
          Link3 <ExternalLink size={10} />
        </a>
        {/* Social icons */}
        <div className="flex items-center gap-3 ml-2">
          <button className="text-[#7a7a83] hover:text-[#f9f9fa] transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </button>
          <button className="text-[#7a7a83] hover:text-[#f9f9fa] transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

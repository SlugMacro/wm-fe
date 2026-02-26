import { useState, useEffect, useRef } from 'react';
import { useLiveMarkets } from '../hooks/useLiveMarketContext';

/* ───── Icons ───── */

function ArrowRightUpIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path
        d="M3.5 8.5L8.5 3.5M8.5 3.5H4.5M8.5 3.5V7.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.36-.76-.54-1.09c-.01-.02-.04-.03-.07-.03c-1.5.26-2.93.71-4.27 1.33c-.01 0-.02.01-.03.02c-2.72 4.07-3.47 8.03-3.1 11.95c0 .02.01.04.03.05c1.8 1.32 3.53 2.12 5.24 2.65c.03.01.06 0 .07-.02c.4-.55.76-1.13 1.07-1.74c.02-.04 0-.08-.04-.09c-.57-.22-1.11-.48-1.64-.78c-.04-.02-.04-.08-.01-.11c.11-.08.22-.17.33-.25c.02-.02.05-.02.07-.01c3.44 1.57 7.15 1.57 10.55 0c.02-.01.05-.01.07.01c.11.09.22.17.33.26c.04.03.04.09-.01.11c-.52.31-1.07.56-1.64.78c-.04.01-.05.06-.04.09c.32.61.68 1.19 1.07 1.74c.03.01.06.02.09.01c1.72-.53 3.45-1.33 5.25-2.65c.02-.01.03-.03.03-.05c.44-4.53-.73-8.46-3.1-11.95c-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.83 2.12-1.89 2.12z" />
    </svg>
  );
}

/* ───── Animated Number ───── */

function AnimatedValue({ value }: { value: number }) {
  const [display, setDisplay] = useState(value);
  const [flash, setFlash] = useState(false);
  const prevRef = useRef(value);

  useEffect(() => {
    if (value !== prevRef.current) {
      setFlash(true);
      // Animate from previous to new value over 600ms
      const start = prevRef.current;
      const diff = value - start;
      const duration = 600;
      const startTime = performance.now();

      const animate = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // ease-out quad
        const eased = 1 - (1 - progress) * (1 - progress);
        setDisplay(start + diff * eased);
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          prevRef.current = value;
          setTimeout(() => setFlash(false), 400);
        }
      };
      requestAnimationFrame(animate);
    }
  }, [value]);

  const formatted = display.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <span
      className={`text-xs font-medium tabular-nums transition-colors duration-300 ${
        flash ? 'text-[#5bd197]' : 'text-[#f9f9fa]'
      }`}
    >
      ${formatted}
    </span>
  );
}

/* ───── Main Component ───── */

export default function BottomStats() {
  const { totalVol, vol24h } = useLiveMarkets();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 hidden lg:flex items-center justify-between bg-[#0a0a0b] px-12 py-3">
      {/* Left - Live data */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="size-2 rounded-full bg-[#16c284] animate-pulse" />
          <span className="text-xs font-medium uppercase text-[#7a7a83]">Live Data</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-normal text-[#7a7a83]">Total Vol</span>
          <AnimatedValue value={totalVol} />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-normal text-[#7a7a83]">Vol 24h</span>
          <AnimatedValue value={vol24h} />
        </div>
      </div>

      {/* Right - Links */}
      <div className="flex items-center gap-4">
        <a
          href="#"
          className="flex items-center gap-1 text-xs font-normal text-[#7a7a83] transition-colors hover:text-[#f9f9fa]"
          onClick={(e) => e.preventDefault()}
        >
          Docs <ArrowRightUpIcon />
        </a>
        <a
          href="#"
          className="flex items-center gap-1 text-xs font-normal text-[#7a7a83] transition-colors hover:text-[#f9f9fa]"
          onClick={(e) => e.preventDefault()}
        >
          Dune <ArrowRightUpIcon />
        </a>
        <a
          href="#"
          className="flex items-center gap-1 text-xs font-normal text-[#7a7a83] transition-colors hover:text-[#f9f9fa]"
          onClick={(e) => e.preventDefault()}
        >
          Link3 <ArrowRightUpIcon />
        </a>
        {/* Social icons */}
        <div className="flex items-center gap-3 ml-2">
          <button className="text-[#7a7a83] hover:text-[#f9f9fa] transition-colors">
            <XIcon />
          </button>
          <button className="text-[#7a7a83] hover:text-[#f9f9fa] transition-colors">
            <DiscordIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

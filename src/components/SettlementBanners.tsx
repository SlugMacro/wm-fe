import { useState, useEffect, useRef } from 'react';
import { liveMarkets } from '../mock-data/markets';

// Token images (reuse from existing assets)
import tokenSkate from '../assets/images/token-skate.png';
import tokenZbt from '../assets/images/token-zbt.png';
import tokenEra from '../assets/images/token-era.png';
import tokenGrass from '../assets/images/token-grass.png';
import tokenMmt from '../assets/images/token-mmt.png';

// Banner decorations
import bannerBlueLeftSvg from '../assets/images/banner-blue-left.svg';
import bannerBlueGlowSvg from '../assets/images/banner-blue-glow.svg';
import bannerGreenLeftSvg from '../assets/images/banner-green-left.svg';
import bannerGreenRightSvg from '../assets/images/banner-green-right.svg';
import bannerGreenGlowSvg from '../assets/images/banner-green-glow.svg';

/* ───── Token image map ───── */

const TOKEN_IMAGES: Record<string, string> = {
  ZBT: tokenZbt,
  SKATE: tokenSkate,
  ERA: tokenEra,
  GRASS: tokenGrass,
  MMT: tokenMmt,
};

/* ───── Types ───── */

interface SettlementMarket {
  id: string;
  tokenSymbol: string;
  settleTime: string;
}

/* ───── Helpers ───── */

function formatSettleDate(isoStr: string): string {
  const d = new Date(isoStr);
  const hours = d.getHours().toString().padStart(2, '0');
  const mins = d.getMinutes().toString().padStart(2, '0');
  const day = d.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${hours}:${mins}, ${day} ${month} ${year}`;
}

/* ───── Countdown hook ───── */

function useCountdown(targetTime: string) {
  const [remaining, setRemaining] = useState(() => {
    return Math.max(0, new Date(targetTime).getTime() - Date.now());
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(Math.max(0, new Date(targetTime).getTime() - Date.now()));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetTime]);

  const totalSec = Math.floor(remaining / 1000);
  return {
    h: Math.floor(totalSec / 3600),
    m: Math.floor((totalSec % 3600) / 60),
    s: totalSec % 60,
  };
}

/* ───── Icons ───── */

function InfoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M10 0C15.523 0 20 4.477 20 10C20 15.523 15.523 20 10 20C4.477 20 0 15.523 0 10C0 4.477 4.477 0 10 0ZM10 2C7.87827 2 5.84344 2.84285 4.34315 4.34315C2.84285 5.84344 2 7.87827 2 10C2 12.1217 2.84285 14.1566 4.34315 15.6569C5.84344 17.1571 7.87827 18 10 18C12.1217 18 14.1566 17.1571 15.6569 15.6569C17.1571 14.1566 18 12.1217 18 10C18 7.87827 17.1571 5.84344 15.6569 4.34315C14.1566 2.84285 12.1217 2 10 2ZM9.99 8C10.548 8 11 8.452 11 9.01V14.134C11.1906 14.2441 11.3396 14.414 11.4238 14.6173C11.5081 14.8207 11.5229 15.0462 11.4659 15.2588C11.4089 15.4714 11.2834 15.6593 11.1087 15.7933C10.9341 15.9273 10.7201 16 10.5 16H10.01C9.87737 16 9.74603 15.9739 9.62349 15.9231C9.50095 15.8724 9.38961 15.798 9.29582 15.7042C9.20203 15.6104 9.12764 15.499 9.07688 15.3765C9.02612 15.254 9 15.1226 9 14.99V10C8.73478 10 8.48043 9.89464 8.29289 9.70711C8.10536 9.51957 8 9.26522 8 9C8 8.73478 8.10536 8.48043 8.29289 8.29289C8.48043 8.10536 8.73478 8 9 8H9.99ZM10 5C10.2652 5 10.5196 5.10536 10.7071 5.29289C10.8946 5.48043 11 5.73478 11 6C11 6.26522 10.8946 6.51957 10.7071 6.70711C10.5196 6.89464 10.2652 7 10 7C9.73478 7 9.48043 6.89464 9.29289 6.70711C9.10536 6.51957 9 6.26522 9 6C9 5.73478 9.10536 5.48043 9.29289 5.29289C9.48043 5.10536 9.73478 5 10 5Z"
        fill="#7A7A83"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="8" height="13" viewBox="0 0 7.67 13.31" fill="none">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.376 5.938a1 1 0 010 1.414L1.72 13.009a1 1 0 01-1.415-1.414l4.95-4.95L.305 1.695A1 1 0 011.72.28l5.657 5.657z"
        fill="#0a0a0b"
      />
    </svg>
  );
}

/* ───── Market pill — upcoming (green date) ───── */

function UpcomingPill({ market }: { market: SettlementMarket }) {
  const icon = TOKEN_IMAGES[market.tokenSymbol];
  return (
    <div className="flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-[16px] pl-2 pr-4 py-2 shrink-0">
      <div className="flex items-center gap-2">
        {icon ? (
          <img src={icon} alt={market.tokenSymbol} className="size-5 rounded-full object-cover" />
        ) : (
          <div className="size-5 rounded-full bg-[#4b5563] flex items-center justify-center">
            <span className="text-[8px] font-bold text-white">{market.tokenSymbol.charAt(0)}</span>
          </div>
        )}
        <span className="text-sm font-medium leading-5 text-[#f9f9fa] tabular-nums">
          {market.tokenSymbol}
        </span>
      </div>
      <span className="text-sm font-medium leading-5 text-[#5bd197] tabular-nums">
        {formatSettleDate(market.settleTime)}
      </span>
    </div>
  );
}

/* ───── Market pill — settling (orange countdown) ───── */

function SettlingPill({ market }: { market: SettlementMarket }) {
  const icon = TOKEN_IMAGES[market.tokenSymbol];
  const { h, m, s } = useCountdown(market.settleTime);
  return (
    <div className="flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-[16px] pl-2 pr-4 py-2 shrink-0">
      <div className="flex items-center gap-2">
        {icon ? (
          <img src={icon} alt={market.tokenSymbol} className="size-5 rounded-full object-cover" />
        ) : (
          <div className="size-5 rounded-full bg-[#4b5563] flex items-center justify-center">
            <span className="text-[8px] font-bold text-white">{market.tokenSymbol.charAt(0)}</span>
          </div>
        )}
        <span className="text-sm font-medium leading-5 text-[#f9f9fa] tabular-nums">
          {market.tokenSymbol}
        </span>
      </div>
      <div className="flex items-center gap-0.5 text-sm font-medium leading-5 text-[#fb923c] tabular-nums">
        <span>{h}h</span>
        <span className="opacity-40">:</span>
        <span>{m}m</span>
        <span className="opacity-40">:</span>
        <span>{s}s</span>
      </div>
    </div>
  );
}

/* ───── Empty state pill ───── */

function EmptyPill({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-[16px] pl-2 pr-4 py-2">
      <div className="p-0.5">
        <InfoIcon />
      </div>
      <span className="text-sm font-medium leading-5 text-[#f9f9fa] tabular-nums">{text}</span>
    </div>
  );
}

/* ───── Banner shell ───── */

interface BannerProps {
  title: string;
  variant: 'blue' | 'green';
  markets: SettlementMarket[];
  type: 'upcoming' | 'settling';
  emptyText: string;
}

function Banner({ title, variant, markets, type, emptyText }: BannerProps) {
  const isBlue = variant === 'blue';
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const check = () => setShowScroll(el.scrollWidth > el.clientWidth + 4);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [markets]);

  const handleScrollRight = () => {
    scrollRef.current?.scrollBy({ left: 200, behavior: 'smooth' });
  };

  return (
    <div
      className={`flex-1 relative overflow-clip rounded-[10px] pt-3 pb-4 px-5 flex items-center min-w-0 ${
        isBlue ? 'bg-[rgba(59,130,246,0.2)]' : 'bg-[rgba(22,194,132,0.2)]'
      }`}
    >
      {/* ── Left decoration ── */}
      <img
        src={isBlue ? bannerBlueLeftSvg : bannerGreenLeftSvg}
        alt=""
        className="absolute left-0 top-0 w-[461px] h-[96px] pointer-events-none"
      />

      {/* ── Right decoration (green banner) ── */}
      {!isBlue && (
        <div className="absolute right-0 top-0 w-[261px] h-[96px] pointer-events-none rotate-180 -scale-y-100">
          <img src={bannerGreenRightSvg} alt="" className="w-full h-full" />
        </div>
      )}

      {/* ── Center glow ── */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: 'calc(50% - 218.5px)',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: '667px',
          height: isBlue ? '489px' : '473px',
        }}
      >
        <img
          src={isBlue ? bannerBlueGlowSvg : bannerGreenGlowSvg}
          alt=""
          className="w-full h-full"
        />
      </div>

      {/* ── Content ── */}
      <div className="flex-1 flex flex-col gap-1 relative z-10 min-w-0">
        {/* Header */}
        <div className="flex items-center h-5">
          <span className="text-xs font-normal leading-4 text-white/60 tabular-nums">{title}</span>
        </div>

        {/* Markets row */}
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-2 items-start overflow-x-auto scrollbar-none"
          >
            {markets.length > 0
              ? markets.map((m) =>
                  type === 'upcoming' ? (
                    <UpcomingPill key={m.id} market={m} />
                  ) : (
                    <SettlingPill key={m.id} market={m} />
                  ),
                )
              : <EmptyPill text={emptyText} />}
          </div>

          {/* Gradient mask + scroll button (when pills overflow) */}
          {showScroll && (
            <>
              <div
                className={`absolute right-[-20px] bottom-0 h-[36px] w-[96px] bg-gradient-to-l to-transparent pointer-events-none ${
                  isBlue ? 'from-[#0b1a33]' : 'from-[#0c2f23]'
                }`}
              />
              <button
                onClick={handleScrollRight}
                className="absolute right-0 top-1/2 -translate-y-1/2 bg-[#f9f9fa] rounded-full p-1.5 flex items-center justify-center hover:opacity-90 transition-opacity z-20"
              >
                <div className="p-0.5">
                  <ChevronRightIcon />
                </div>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ───── Main component ───── */

export default function SettlementBanners() {
  // Upcoming: markets with settlementStatus === 'upcoming'
  const upcomingMarkets: SettlementMarket[] = liveMarkets
    .filter((m) => m.settlementStatus === 'upcoming' && m.settleTime)
    .map((m) => ({
      id: m.id,
      tokenSymbol: m.tokenSymbol,
      settleTime: m.settleTime!,
    }));

  // Currently settling: no markets in this state for now
  const settlingMarkets: SettlementMarket[] = [];

  return (
    <div className="flex gap-5">
      <Banner
        title="Upcoming Settlements"
        variant="blue"
        markets={upcomingMarkets}
        type="upcoming"
        emptyText="No markets in upcoming settlements"
      />
      <Banner
        title="Current Settlements"
        variant="green"
        markets={settlingMarkets}
        type="settling"
        emptyText="No markets in current settlements"
      />
    </div>
  );
}

import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import mascotSvg from '../assets/images/mascot.svg';
import logoTopSvg from '../assets/images/logo-top.svg';
import logoBottomSvg from '../assets/images/logo-bottom.svg';
import chainSolanaPng from '../assets/images/chain-solana.png';
import tokenFeePng from '../assets/images/token-fee.png';
import tokenSolPng from '../assets/images/token-sol.png';
import tokenEthPng from '../assets/images/token-eth.png';
import tokenSuiPng from '../assets/images/token-sui.png';
import avatarPng from '../assets/images/avatar.png';
import duneDashboardPng from '../assets/images/dune-dashboard.png';
import ConnectWalletModal from './ConnectWalletModal';
import { useWallet } from '../hooks/useWalletContext';

interface NavItemProps {
  to: string;
  label: string;
}

/* ───── Icons ───── */

function ChevronDownIcon({ className, size = 16 }: { className?: string; size?: number }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M4.5 6.5L8 10L11.5 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function QuestionIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 13.333 13.333" fill="none">
      <path d="M6.667 0a6.667 6.667 0 1 1 0 13.333A6.667 6.667 0 0 1 6.667 0Zm0 1.333a5.333 5.333 0 1 0 0 10.667 5.333 5.333 0 0 0 0-10.667Zm0 8a.667.667 0 1 1 0 1.334.667.667 0 0 1 0-1.334Zm0-6.333a2.417 2.417 0 0 1 2.373 2.917 2.42 2.42 0 0 1-1.474 1.743c-.077.03-.147.075-.204.134a.143.143 0 0 0-.033.12l.005.086a.667.667 0 0 1-1.334.078V8c0-.768.62-1.23 1.07-1.41a1.09 1.09 0 0 0 .575-.67 1.09 1.09 0 0 0-.23-1.103 1.083 1.083 0 0 0-1.824.6.667.667 0 1 1-1.333 0A2.417 2.417 0 0 1 6.667 3Z" fill="currentColor" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M6.235 6.453a8 8 0 0 0 8.817 12.944c.115-.75-.137-1.47-.24-1.722c-.23-.56-.988-1.517-2.253-2.844c-.338-.355-.316-.627-.195-1.437l.013-.091c.082-.554.22-.882 2.085-1.178c.948-.15 1.197.228 1.542.753l.116.172c.328.48.571.59.938.756c.165.075.37.17.645.325c.652.373.652.794.652 1.716v.105c0 .391-.038.735-.098 1.034a8.002 8.002 0 0 0-3.105-12.341c-.553.373-1.312.902-1.577 1.265c-.135.185-.327 1.132-.95 1.21c-.162.02-.381.006-.613-.009c-.622-.04-1.472-.095-1.744.644c-.173.468-.203 1.74.356 2.4c.09.105.107.3.046.519c-.08.287-.241.462-.292.498c-.096-.056-.288-.279-.419-.43c-.313-.366-.705-.82-1.211-.96c-.184-.051-.386-.093-.583-.135c-.549-.115-1.17-.246-1.315-.554c-.106-.226-.105-.537-.105-.865c0-.417 0-.888-.204-1.345a1.3 1.3 0 0 0-.306-.43M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10s-4.477 10-10 10" fill="currentColor" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M18.031 16.617l4.283 4.282-1.415 1.415-4.282-4.283A8.96 8.96 0 0 1 11 20c-4.968 0-9-4.032-9-9s4.032-9 9-9 9 4.032 9 9a8.96 8.96 0 0 1-1.969 5.617zM16.025 15.87A6.981 6.981 0 0 0 18 11c0-3.868-3.133-7-7-7-3.868 0-7 3.132-7 7 0 3.867 3.132 7 7 7a6.981 6.981 0 0 0 4.875-1.975l.15-.155z" fill="currentColor" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M9.55 18l-5.7-5.7 1.425-1.425L9.55 15.15l9.175-9.175L20.15 7.4 9.55 18z" fill="#19fb9b" />
    </svg>
  );
}

/* ───── Language Data ───── */

interface Language {
  code: string;
  label: string;
}

const LANGUAGES: Language[] = [
  { code: 'en', label: 'English' },
  { code: 'zh-CN', label: '简体中文' },
  { code: 'zh-TW', label: '繁體中文' },
  { code: 'es', label: 'Español' },
  { code: 'ru', label: 'Русский' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'pt', label: 'Português' },
  { code: 'tr', label: 'Türkçe' },
];

/* ───── Language Dropdown ───── */

function LanguageDropdown() {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
    } else {
      setVisible(false);
    }
  }, [open]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      setOpen(false);
      setSearch('');
    }, 150);
  };

  const handleSelect = (code: string) => {
    setSelectedLang(code);
    handleClose();
  };

  const filteredLanguages = LANGUAGES.filter((lang) =>
    lang.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative">
      {/* Globe Button */}
      <button
        onClick={() => (open ? handleClose() : setOpen(true))}
        className="flex items-center justify-center rounded-full bg-[#1b1b1c] p-2 text-[#f9f9fa] transition-colors hover:bg-[#252527]"
      >
        <GlobeIcon />
      </button>

      {/* Dropdown */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={handleClose} />
          <div
            className={`absolute right-0 top-full mt-2 z-50 w-[256px] rounded-xl bg-[#1b1b1c] shadow-[0_0_32px_rgba(0,0,0,0.2)] overflow-hidden transition-all duration-150 origin-top-right ${
              visible
                ? 'opacity-100 scale-100 translate-y-0'
                : 'opacity-0 scale-95 -translate-y-1'
            }`}
          >
            {/* Search */}
            <div className="flex items-center gap-2 h-10 px-3 border-b border-[#272727]">
              <div className="flex items-center p-0.5 text-[#717171] shrink-0">
                <SearchIcon />
              </div>
              <input
                type="text"
                placeholder="Search language"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm text-[#f9f9fa] placeholder-[#717171] outline-none min-w-0"
                autoFocus
              />
            </div>

            {/* Language List */}
            <div className="flex flex-col gap-1 p-2 max-h-[280px] overflow-y-auto scrollbar-thin">
              {filteredLanguages.map((lang) => {
                const isSelected = lang.code === selectedLang;
                return (
                  <button
                    key={lang.code}
                    onClick={() => handleSelect(lang.code)}
                    className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 transition-colors ${
                      isSelected ? 'bg-[#252527]' : 'hover:bg-[#252527]'
                    }`}
                  >
                    <span className="text-sm font-medium text-[#f9f9fa]">
                      {lang.label}
                    </span>
                    {isSelected && (
                      <div className="flex items-center p-0.5 shrink-0 ml-auto">
                        <CheckIcon />
                      </div>
                    )}
                  </button>
                );
              })}
              {filteredLanguages.length === 0 && (
                <div className="px-2 py-3 text-sm text-[#717171] text-center">No results</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function CopyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect x="8" y="8" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M16 8V6C16 4.9 15.1 4 14 4H6C4.9 4 4 4.9 4 6V14C4 15.1 4.9 16 6 16H8" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function ArrowRightUpIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
      <path d="M3.5 8.5L8.5 3.5M8.5 3.5H4.5M8.5 3.5V7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DashboardIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M20 22H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1zm-1-2V4H5v16h14zM8 9h8v2H8V9zm0 4h8v2H8v-2z" fill="currentColor" />
    </svg>
  );
}

function StakingIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M19 7h-1V2H6v5H5c-1.654 0-3 1.346-3 3v7c0 1.654 1.346 3 3 3h14c1.654 0 3-1.346 3-3v-7c0-1.654-1.346-3-3-3zM8 4h8v3H8V4zm12 13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v7zm-5-4a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" fill="currentColor" />
    </svg>
  );
}

function ReferralIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M14 14.252v2.09A6 6 0 0 0 6 22H4a8 8 0 0 1 10-7.748zM12 13c-3.315 0-6-2.685-6-6s2.685-6 6-6 6 2.685 6 6-2.685 6-6 6zm0-2c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm6 6v-3h2v3h3v2h-3v3h-2v-3h-3v-2h3z" fill="currentColor" />
    </svg>
  );
}

function ExitIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M5 22a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v3h-2V4H6v16h12v-2h2v3a1 1 0 0 1-1 1H5zm13-6v-3H10v-2h8V8l5 4-5 4z" fill="currentColor" />
    </svg>
  );
}

/* ───── Nav Item ───── */

function NavItem({ to, label }: NavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:text-[#19fb9b] ${
          isActive ? 'text-[#19fb9b]' : 'text-[#f9f9fa]'
        }`
      }
    >
      {label}
    </NavLink>
  );
}

/* ───── Dropdown Menu Icons (16x16 — synced with user dropdown) ───── */

function ArrowRightLineIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2h12.172z" />
    </svg>
  );
}

function BookLineIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 22H6.5A3.5 3.5 0 0 1 3 18.5V5a3 3 0 0 1 3-3h14v15.5a1 1 0 0 1-2 0 1.5 1.5 0 0 0-3 0V22zm-2-5.5a3.49 3.49 0 0 0-2 .63V4H6a1 1 0 0 0-1 1v13.5A1.5 1.5 0 0 0 6.5 20H18v-3.5zM10 10h4v2h-4v-2z" />
    </svg>
  );
}

function PigMoneyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 7h-1V2H6v5H5c-1.654 0-3 1.346-3 3v7c0 1.654 1.346 3 3 3h14c1.654 0 3-1.346 3-3v-7c0-1.654-1.346-3-3-3zM8 4h8v3H8V4zm12 13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v7zm-5-4a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
    </svg>
  );
}

function UserAddIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M14 14.252v2.09A6 6 0 0 0 6 22H4a8 8 0 0 1 10-7.748zM12 13c-3.315 0-6-2.685-6-6s2.685-6 6-6 6 2.685 6 6-2.685 6-6 6zm0-2c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm6 6v-3h2v3h3v2h-3v3h-2v-3h-3v-2h3z" />
    </svg>
  );
}

/* ───── Nav Dropdown Menu ───── */

interface NavDropdownMenuItemData {
  icon: React.ReactNode;
  title: string;
  description: string;
  to?: string;
  href?: string;
}

function NavDropdown({
  label,
  items,
  activeRoutes,
}: {
  label: string;
  items: NavDropdownMenuItemData[];
  activeRoutes: string[];
}) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isRouteActive = activeRoutes.some((r) => location.pathname.startsWith(r));

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
    } else {
      setVisible(false);
    }
  }, [open]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => setOpen(false), 150);
  };

  const handleItemClick = (item: NavDropdownMenuItemData) => {
    if (item.to) {
      navigate(item.to);
    } else if (item.href) {
      window.open(item.href, '_blank');
    }
    handleClose();
  };

  const isActive = open || isRouteActive;
  const showGreen = isActive || hovered;

  return (
    <div className="relative">
      <button
        onClick={() => (open ? handleClose() : setOpen(true))}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`flex items-center gap-1.5 pl-4 pr-2 py-2 text-sm font-medium transition-colors ${
          showGreen ? 'text-[#19fb9b]' : 'text-[#f9f9fa]'
        } hover:text-[#19fb9b]`}
      >
        {label}
        <div
          className={`flex items-center p-0.5 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        >
          <ChevronDownIcon
            className={`transition-colors ${showGreen ? 'text-[#19fb9b]' : 'text-[#7a7a83]'}`}
          />
        </div>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={handleClose} />
          <div
            className={`absolute left-0 top-full mt-2 z-50 w-[280px] rounded-xl bg-[#1b1b1c] shadow-[0_0_32px_rgba(0,0,0,0.2)] overflow-hidden transition-all duration-150 origin-top-left p-4 flex flex-col gap-4 ${
              visible
                ? 'opacity-100 scale-100 translate-y-0'
                : 'opacity-0 scale-95 -translate-y-1'
            }`}
          >
            {items.map((item, i) => {
              const isLast = i === items.length - 1;
              return (
                <button
                  key={item.title}
                  onClick={() => handleItemClick(item)}
                  className="flex gap-2 items-start w-full text-left group"
                >
                  <div className="flex items-center p-0.5 shrink-0 text-[#f9f9fa] group-hover:text-[#5bd197] transition-colors duration-200">
                    {item.icon}
                  </div>
                  <div
                    className={`flex flex-1 flex-col gap-1 ${
                      !isLast ? 'pb-4 border-b border-[#252527]' : ''
                    }`}
                  >
                    <div className="flex items-center gap-0">
                      <span className="text-sm font-medium text-[#f9f9fa] group-hover:text-[#5bd197] transition-colors duration-200">
                        {item.title}
                      </span>
                      <div className="flex items-center text-[#5bd197] max-w-0 opacity-0 -translate-x-1 group-hover:max-w-[20px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 overflow-hidden ml-0 group-hover:ml-1">
                        <ArrowRightLineIcon />
                      </div>
                    </div>
                    <span className="text-xs font-normal text-[#7a7a83] leading-4">
                      {item.description}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

/* ───── Dropdown Menu Data ───── */

const RESOURCE_MENU: NavDropdownMenuItemData[] = [
  {
    icon: <img src={mascotSvg} alt="" className="size-4" />,
    title: 'About',
    description: 'Learn about Whales Market',
    to: '/about',
  },
  {
    icon: <BookLineIcon />,
    title: 'Docs',
    description: 'Technical documentation',
    href: 'https://github.com/SlugMacro/wm-fe',
  },
  {
    icon: <img src={duneDashboardPng} alt="" className="size-4 rounded-full object-cover" />,
    title: 'Dune Dashboard',
    description: 'On-chain analytics',
    href: 'https://github.com/SlugMacro/wm-fe',
  },
];

const EARN_MENU: NavDropdownMenuItemData[] = [
  {
    icon: <PigMoneyIcon />,
    title: 'Stake',
    description: 'Secure. Stake. Earn.',
    to: '/staking',
  },
  {
    icon: <UserAddIcon />,
    title: 'Referral',
    description: 'Bring users. Share gains.',
    to: '/referral',
  },
  {
    icon: <UserAddIcon />,
    title: 'Affiliate',
    description: 'Join teams. Earn extra rewards.',
    to: '/affiliate',
  },
];

/* ───── Avatar Dropdown ───── */

interface DropdownMenuItemProps {
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
  onClick: () => void;
}

function DropdownMenuItem({ icon, label, danger, onClick }: DropdownMenuItemProps) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 transition-colors ${
        danger
          ? 'text-[#fd5e67] hover:bg-[#252527]'
          : 'text-[#f9f9fa] hover:bg-[#252527]'
      }`}
    >
      <div className="flex items-center p-0.5 shrink-0">{icon}</div>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

function AvatarDropdown({ onDisconnect }: { onDisconnect: () => void }) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const walletAddress = 'GQ98...iA5Y';

  // Dropdown open/close animation
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
    } else {
      setVisible(false);
    }
  }, [open]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => setOpen(false), 150);
  };

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    handleClose();
  };

  return (
    <div className="relative">
      {/* Avatar Button */}
      <button onClick={() => (open ? handleClose() : setOpen(true))} className="flex items-center p-0.5">
        <div className="flex items-center justify-center overflow-hidden rounded-full border-2 border-[#0a0a0b] bg-[#252527] size-8">
          <img src={avatarPng} alt="Avatar" className="size-8 object-cover" />
        </div>
      </button>

      {/* Dropdown */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={handleClose} />
          <div
            className={`absolute right-0 top-full mt-2 z-50 w-[256px] rounded-xl bg-[#1b1b1c] shadow-[0_0_32px_rgba(0,0,0,0.2)] overflow-hidden transition-all duration-150 origin-top-right ${
              visible
                ? 'opacity-100 scale-100 translate-y-0'
                : 'opacity-0 scale-95 -translate-y-1'
            }`}
          >
            {/* Wallet Info */}
            <div className="flex items-center gap-3 p-4 border-b border-[#252527]">
              <div className="flex items-center p-0.5 shrink-0">
                <div className="flex items-center justify-center overflow-hidden rounded-full bg-[#252527] size-10">
                  <img src={avatarPng} alt="Avatar" className="size-10 object-cover" />
                </div>
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-base font-medium text-[#f9f9fa] tabular-nums">{walletAddress}</span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center p-1 text-[#7a7a83] hover:text-[#f9f9fa] transition-colors"
                  >
                    {copied ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="#16c284" />
                      </svg>
                    ) : (
                      <CopyIcon />
                    )}
                  </button>
                </div>
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="flex items-center gap-0.5 text-xs text-[#7a7a83] hover:text-[#f9f9fa] transition-colors w-fit"
                >
                  <span className="border-b border-[#3a3a3d]">Open in Explorer</span>
                  <ArrowRightUpIcon size={12} />
                </a>
              </div>
            </div>

            {/* Menu Items */}
            <div className="flex flex-col gap-1 p-2 border-b border-[#252527]">
              <DropdownMenuItem
                icon={<DashboardIcon />}
                label="Dashboard"
                onClick={() => handleNavigate('/dashboard')}
              />
              <DropdownMenuItem
                icon={<StakingIcon />}
                label="Staking"
                onClick={() => handleNavigate('/staking')}
              />
              <DropdownMenuItem
                icon={<img src={tokenFeePng} alt="" className="size-4 rounded-full" />}
                label="Incentives"
                onClick={() => handleNavigate('/incentives')}
              />
              <DropdownMenuItem
                icon={<ReferralIcon />}
                label="Referral"
                onClick={() => handleNavigate('/referral')}
              />
            </div>

            {/* Disconnect */}
            <div className="flex flex-col gap-1 p-2">
              <DropdownMenuItem
                icon={<ExitIcon />}
                label="Disconnect"
                danger
                onClick={() => {
                  onDisconnect();
                  handleClose();
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ───── Main Header ───── */

export default function Header() {
  const wallet = useWallet();
  const { isConnected } = wallet;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="flex items-center justify-center border-b border-[#1b1b1c] bg-[#0a0a0b] px-0 py-3">
        <div className="flex flex-1 items-center gap-4 max-w-[1440px] px-4 lg:px-12">
          {/* Logo + Menu */}
          <div className="flex flex-1 items-center gap-2">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="flex items-center justify-center rounded-lg p-2 text-[#f9f9fa] lg:hidden"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>

            {/* Logo */}
            <NavLink to="/" className="flex items-center gap-1.5 p-1.5 shrink-0">
              <img src={mascotSvg} alt="Whales Market" className="w-6 h-6" />
              <div className="relative hidden lg:block" style={{ width: '172px', height: '15px' }}>
                <img
                  src={logoTopSvg}
                  alt=""
                  className="absolute left-0 top-0"
                  style={{ width: '82.58px', height: '14.52px' }}
                />
                <img
                  src={logoBottomSvg}
                  alt=""
                  className="absolute"
                  style={{ width: '82.62px', height: '14px', left: '89.2px', top: '0.26px' }}
                />
              </div>
            </NavLink>

            {/* Navigation — hidden on mobile */}
            <nav className="hidden lg:flex flex-1 items-center">
              <NavItem to="/markets" label="Markets" />
              <NavItem to="/dashboard" label="Dashboard" />
              <NavDropdown
                label="Earn"
                items={EARN_MENU}
                activeRoutes={['/earn', '/staking', '/referral', '/affiliate']}
              />
              <NavDropdown
                label="Resources"
                items={RESOURCE_MENU}
                activeRoutes={['/resources', '/about']}
              />
            </nav>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 lg:gap-3 shrink-0">
            {isConnected ? (
              <>
                {/* Chain Selector */}
                <button className="flex items-center gap-1.5 h-9 rounded-lg border border-[#252527] p-2 transition-colors hover:border-[#3a3a3d]">
                  <div className="flex items-center p-0.5">
                    <img src={chainSolanaPng} alt="Solana" className="w-4 h-4 rounded" />
                  </div>
                  <div className="flex items-center p-0.5">
                    <ChevronDownIcon className="text-[#7a7a83]" />
                  </div>
                </button>

                {/* Fee — hidden on mobile */}
                <button className="hidden lg:flex items-center gap-1.5 h-9 rounded-lg border border-[#252527] p-2 overflow-hidden transition-colors hover:border-[#3a3a3d]">
                  <div className="flex items-center p-0.5">
                    <img src={tokenFeePng} alt="" className="w-4 h-4 rounded-full" />
                  </div>
                  <span className="text-sm font-medium text-[#f9f9fa] whitespace-nowrap tabular-nums">0.00</span>
                  <div className="flex items-center justify-center rounded-full bg-[rgba(22,194,132,0.1)] px-2 py-1">
                    <span className="text-[10px] font-medium uppercase leading-3 text-[#5bd197]">-0% Fee</span>
                  </div>
                </button>

                {/* Balance */}
                <button className="flex items-center gap-1.5 h-9 rounded-lg border border-[#252527] pl-2 pr-3 py-2 transition-colors hover:border-[#3a3a3d]">
                  <div className="flex items-center p-0.5">
                    <img
                      src={wallet.connectedChain === 'ethereum' ? tokenEthPng : wallet.connectedChain === 'sui' ? tokenSuiPng : tokenSolPng}
                      alt={wallet.connectedChain === 'ethereum' ? 'ETH' : wallet.connectedChain === 'sui' ? 'SUI' : 'SOL'}
                      className="w-4 h-4 rounded-full"
                    />
                  </div>
                  <span className="text-sm font-medium text-[#f9f9fa] tabular-nums">{wallet.walletBalance.toFixed(2)}</span>
                </button>

                {/* Avatar with Dropdown */}
                <AvatarDropdown onDisconnect={() => wallet.disconnect()} />
              </>
            ) : (
              /* Disconnected state - Connect button */
              <button
                onClick={() => wallet.openConnectModal()}
                className="flex items-center h-9 px-4 rounded-lg bg-[#f9f9fa] text-sm font-medium text-[#0a0a0b] hover:bg-[#e0e0e2] transition-colors"
              >
                Connect
              </button>
            )}

            {/* Divider — hidden on mobile */}
            <div className="hidden lg:block h-4 w-px bg-[#252527]" />

            {/* Help → GitHub Docs — hidden on mobile */}
            <a
              href="https://github.com/SlugMacro/wm-fe"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center justify-center rounded-full bg-[#1b1b1c] p-2 text-[#f9f9fa] transition-colors hover:bg-[#252527]"
            >
              <QuestionIcon />
            </a>

            {/* Language Selector — hidden on mobile */}
            <div className="hidden lg:block">
              <LanguageDropdown />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed top-0 left-0 bottom-0 z-50 w-[280px] bg-[#0a0a0b] border-r border-[#1b1b1c] p-4 flex flex-col gap-2 lg:hidden">
            {/* Close */}
            <div className="flex items-center justify-between mb-4">
              <NavLink to="/" className="flex items-center gap-1.5" onClick={() => setMobileMenuOpen(false)}>
                <img src={mascotSvg} alt="Whales Market" className="w-6 h-6" />
                <div className="relative" style={{ width: '172px', height: '15px' }}>
                  <img src={logoTopSvg} alt="" className="absolute left-0 top-0" style={{ width: '82.58px', height: '14.52px' }} />
                  <img src={logoBottomSvg} alt="" className="absolute" style={{ width: '82.62px', height: '14px', left: '89.2px', top: '0.26px' }} />
                </div>
              </NavLink>
              <button onClick={() => setMobileMenuOpen(false)} className="text-[#7a7a83] p-1">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
              </button>
            </div>
            {/* Nav links */}
            <NavLink to="/markets" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'text-[#19fb9b] bg-[#1b1b1c]' : 'text-[#f9f9fa] hover:bg-[#1b1b1c]'}`}>Markets</NavLink>
            <NavLink to="/dashboard" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'text-[#19fb9b] bg-[#1b1b1c]' : 'text-[#f9f9fa] hover:bg-[#1b1b1c]'}`}>Dashboard</NavLink>
            <div className="h-px bg-[#1b1b1c] my-1" />
            <span className="px-3 text-xs font-medium text-[#7a7a83] uppercase">Earn</span>
            <NavLink to="/staking" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'text-[#19fb9b] bg-[#1b1b1c]' : 'text-[#f9f9fa] hover:bg-[#1b1b1c]'}`}>Stake</NavLink>
            <NavLink to="/referral" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'text-[#19fb9b] bg-[#1b1b1c]' : 'text-[#f9f9fa] hover:bg-[#1b1b1c]'}`}>Referral</NavLink>
            <NavLink to="/affiliate" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'text-[#19fb9b] bg-[#1b1b1c]' : 'text-[#f9f9fa] hover:bg-[#1b1b1c]'}`}>Affiliate</NavLink>
            <div className="h-px bg-[#1b1b1c] my-1" />
            <span className="px-3 text-xs font-medium text-[#7a7a83] uppercase">Resources</span>
            <NavLink to="/about" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'text-[#19fb9b] bg-[#1b1b1c]' : 'text-[#f9f9fa] hover:bg-[#1b1b1c]'}`}>About</NavLink>
            <a href="https://github.com/SlugMacro/wm-fe" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-[#f9f9fa] hover:bg-[#1b1b1c] transition-colors">Docs</a>
          </div>
        </>
      )}

      {/* Connect Wallet Modal */}
      <ConnectWalletModal
        isOpen={wallet.showConnectModal}
        onClose={() => wallet.closeConnectModal()}
        onConnect={() => wallet.connect()}
        defaultNetwork={wallet.defaultModalNetwork}
      />
    </>
  );
}

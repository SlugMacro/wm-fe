import { NavLink } from 'react-router-dom';
import mascotSvg from '../assets/images/mascot.svg';
import logoTopSvg from '../assets/images/logo-top.svg';
import logoBottomSvg from '../assets/images/logo-bottom.svg';
import chainSolanaPng from '../assets/images/chain-solana.png';
import tokenFeePng from '../assets/images/token-fee.png';
import tokenSolPng from '../assets/images/token-sol.png';
import avatarPng from '../assets/images/avatar.png';

interface NavItemProps {
  to: string;
  label: string;
  hasDropdown?: boolean;
}

function ChevronDownIcon({ className, size = 16 }: { className?: string; size?: number }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4.5 6.5L8 10L11.5 6.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function QuestionIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 13.333 13.333"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.667 0a6.667 6.667 0 1 1 0 13.333A6.667 6.667 0 0 1 6.667 0Zm0 1.333a5.333 5.333 0 1 0 0 10.667 5.333 5.333 0 0 0 0-10.667Zm0 8a.667.667 0 1 1 0 1.334.667.667 0 0 1 0-1.334Zm0-6.333a2.417 2.417 0 0 1 2.373 2.917 2.42 2.42 0 0 1-1.474 1.743c-.077.03-.147.075-.204.134a.143.143 0 0 0-.033.12l.005.086a.667.667 0 0 1-1.334.078V8c0-.768.62-1.23 1.07-1.41a1.09 1.09 0 0 0 .575-.67 1.09 1.09 0 0 0-.23-1.103 1.083 1.083 0 0 0-1.824.6.667.667 0 1 1-1.333 0A2.417 2.417 0 0 1 6.667 3Z"
        fill="currentColor"
      />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.235 6.453a8 8 0 0 0 8.817 12.944c.115-.75-.137-1.47-.24-1.722c-.23-.56-.988-1.517-2.253-2.844c-.338-.355-.316-.627-.195-1.437l.013-.091c.082-.554.22-.882 2.085-1.178c.948-.15 1.197.228 1.542.753l.116.172c.328.48.571.59.938.756c.165.075.37.17.645.325c.652.373.652.794.652 1.716v.105c0 .391-.038.735-.098 1.034a8.002 8.002 0 0 0-3.105-12.341c-.553.373-1.312.902-1.577 1.265c-.135.185-.327 1.132-.95 1.21c-.162.02-.381.006-.613-.009c-.622-.04-1.472-.095-1.744.644c-.173.468-.203 1.74.356 2.4c.09.105.107.3.046.519c-.08.287-.241.462-.292.498c-.096-.056-.288-.279-.419-.43c-.313-.366-.705-.82-1.211-.96c-.184-.051-.386-.093-.583-.135c-.549-.115-1.17-.246-1.315-.554c-.106-.226-.105-.537-.105-.865c0-.417 0-.888-.204-1.345a1.3 1.3 0 0 0-.306-.43M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10s-4.477 10-10 10"
        fill="currentColor"
      />
    </svg>
  );
}

function NavItem({ to, label, hasDropdown }: NavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-1.5 rounded-lg ${
          hasDropdown ? 'pl-4 pr-2' : 'px-4'
        } py-2 text-sm font-medium transition-colors hover:text-[#19fb9b] ${
          isActive ? 'text-[#19fb9b]' : 'text-[#f9f9fa]'
        }`
      }
    >
      {label}
      {hasDropdown && (
        <div className="flex items-center p-0.5">
          <ChevronDownIcon className="text-[#7a7a83]" />
        </div>
      )}
    </NavLink>
  );
}

export default function Header() {
  return (
    <header className="flex items-center justify-center border-b border-[#1b1b1c] bg-[#0a0a0b] px-0 py-3">
      <div className="flex flex-1 items-center gap-4 max-w-[1440px] px-12">
        {/* Logo + Menu */}
        <div className="flex flex-1 items-center gap-2">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-1.5 p-1.5 shrink-0">
            <img src={mascotSvg} alt="Whales Market" className="w-6 h-6" />
            <div className="relative" style={{ width: '172px', height: '15px' }}>
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

          {/* Navigation */}
          <nav className="flex flex-1 items-center">
            <NavItem to="/markets" label="Markets" />
            <NavItem to="/dashboard" label="Dashboard" />
            <NavItem to="/earn" label="Earn" hasDropdown />
            <NavItem to="/resources" label="Resources" hasDropdown />
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Chain Selector */}
          <button className="flex items-center gap-1.5 h-9 rounded-lg border border-[#252527] p-2 transition-colors hover:border-[#3a3a3d]">
            <div className="flex items-center p-0.5">
              <img
                src={chainSolanaPng}
                alt="Solana"
                className="w-4 h-4 rounded"
              />
            </div>
            <div className="flex items-center p-0.5">
              <ChevronDownIcon className="text-[#7a7a83]" />
            </div>
          </button>

          {/* Fee */}
          <button className="flex items-center gap-1.5 h-9 rounded-lg border border-[#252527] p-2 overflow-hidden transition-colors hover:border-[#3a3a3d]">
            <div className="flex items-center p-0.5">
              <img
                src={tokenFeePng}
                alt=""
                className="w-4 h-4 rounded-full"
              />
            </div>
            <span className="text-sm font-medium text-[#f9f9fa] whitespace-nowrap tabular-nums">
              0.00
            </span>
            <div className="flex items-center justify-center rounded-full bg-[rgba(22,194,132,0.1)] px-2 py-1">
              <span className="text-[10px] font-medium uppercase leading-3 text-[#5bd197]">
                -0% Fee
              </span>
            </div>
          </button>

          {/* Balance */}
          <button className="flex items-center gap-1.5 h-9 rounded-lg border border-[#252527] pl-2 pr-3 py-2 transition-colors hover:border-[#3a3a3d]">
            <div className="flex items-center p-0.5">
              <img
                src={tokenSolPng}
                alt="SOL"
                className="w-4 h-4 rounded-full"
              />
            </div>
            <span className="text-sm font-medium text-[#f9f9fa] tabular-nums">
              18.32
            </span>
          </button>

          {/* Avatar */}
          <button className="flex items-center p-0.5">
            <div className="flex items-center justify-center overflow-hidden rounded-full border-2 border-[#0a0a0b] bg-[#252527] size-8">
              <img
                src={avatarPng}
                alt="Avatar"
                className="size-8 object-cover"
              />
            </div>
          </button>

          {/* Divider */}
          <div className="h-4 w-px bg-[#252527]" />

          {/* Help */}
          <button className="flex items-center justify-center rounded-full bg-[#1b1b1c] p-2 text-[#f9f9fa] transition-colors hover:bg-[#252527]">
            <QuestionIcon />
          </button>

          {/* Globe */}
          <button className="flex items-center justify-center rounded-full bg-[#1b1b1c] p-2 text-[#f9f9fa] transition-colors hover:bg-[#252527]">
            <GlobeIcon />
          </button>
        </div>
      </div>
    </header>
  );
}

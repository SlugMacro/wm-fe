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

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 9.53 5.77"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.478 5.478a1 1 0 0 1-1.413 0L.293 1.707A1 1 0 0 1 1.707.293L4.771 3.357 7.835.293a1.001 1.001 0 0 1 1.415 1.414L5.479 5.478Z"
        fill="currentColor"
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
      viewBox="0 0 13.333 13.333"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.667 0a6.667 6.667 0 1 1 0 13.333A6.667 6.667 0 0 1 6.667 0Zm1.94 1.697-.118.588a2.67 2.67 0 0 1-1.515 1.847l-.268.061a.667.667 0 0 0-.509.822l.117.698a1.333 1.333 0 0 1-1.376 1.543l-.86-.263a2 2 0 0 1-1.412-2.313v-1.123a5.339 5.339 0 0 0-1.333 4.134 5.339 5.339 0 0 0 3.554 4.182l-.388-1.355a.667.667 0 0 1 .17-.635l-.825-.826a1.333 1.333 0 0 1 1.454-2.174l1.043.49a2 2 0 0 1 1.09 1.54l.073.588a5.332 5.332 0 0 0 .777-4.62 5.333 5.333 0 0 0-2.354-3.137l-.116.652a1.34 1.34 0 0 1-1.026 1.037l-.268.061a1.333 1.333 0 0 1-1.528-.542l-.116-.698a2.667 2.667 0 0 1 1.784-3.076L6.667 1.333c-.358 0-.715.028-1.067.083l.006.019-.003.001v2.345A.667.667 0 0 0 6.27 4.4l.86.262.115.698Z"
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
          <button className="flex items-center gap-1.5 rounded-lg border border-[#252527] p-2 transition-colors hover:border-[#3a3a3d]">
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
          <button className="flex items-center gap-1.5 rounded-lg border border-[#252527] pl-2 pr-3 py-2 transition-colors hover:border-[#3a3a3d]">
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

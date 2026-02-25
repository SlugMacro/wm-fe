import { useEffect, useState } from 'react';

type ToastType = 'waiting' | 'success';

interface ToastProps {
  type: ToastType;
  title: string;
  subtitle: string;
  visible: boolean;
  action?: {
    label: string;
    href: string;
  };
}

function SpinnerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" className="animate-spin">
      <circle cx="10" cy="10" r="8" stroke="#252527" strokeWidth="2.5" fill="none" />
      <path d="M10 2a8 8 0 0 1 8 8" stroke="#19fb9b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="9" fill="#16c284" />
      <path d="M6.5 10L9 12.5L13.5 7.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M3.5 8.5L8.5 3.5M8.5 3.5H4.5M8.5 3.5V7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Toast({ type, title, subtitle, visible, action }: ToastProps) {
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setShow(true));
      });
    } else {
      setShow(false);
      const timer = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!mounted) return null;

  return (
    <div className="fixed bottom-6 left-6 z-[200]">
      <div
        className={`flex items-start gap-3 rounded-xl border border-[#252527] bg-[#1b1b1c] px-4 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.3)] transition-all duration-300 ${
          show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        {/* Icon */}
        <div className="mt-0.5 shrink-0">
          {type === 'waiting' ? <SpinnerIcon /> : <CheckCircleIcon />}
        </div>

        {/* Text */}
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium leading-5 text-[#f9f9fa]">{title}</span>
          <span className="text-xs font-normal leading-4 text-[#7a7a83]">{subtitle}</span>

          {/* Action button */}
          {action && type === 'success' && (
            <a
              href={action.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex w-fit items-center gap-1 rounded-lg border border-[#252527] px-3 py-1.5 text-xs font-medium text-[#f9f9fa] transition-colors hover:bg-[#252527]"
            >
              <span>{action.label}</span>
              <ExternalLinkIcon />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

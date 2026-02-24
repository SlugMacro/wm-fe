import { useNavigate } from 'react-router-dom';

export default function ComingSoonPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <div className="flex flex-col items-center gap-3">
        <div className="size-16 rounded-full bg-[#1b1b1c] flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm1-8.414 2.293-2.293a1 1 0 0 1 1.414 1.414l-3 3a1 1 0 0 1-1.414 0l-3-3a1 1 0 0 1 1.414-1.414L11 11.586V7a1 1 0 1 1 2 0v4.586z" fill="#7a7a83" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-[#f9f9fa]">Coming Soon</h1>
        <p className="text-sm text-[#7a7a83] text-center max-w-[320px]">
          This feature is currently under development and will be available soon.
        </p>
      </div>
      <button
        onClick={() => navigate('/markets')}
        className="flex items-center gap-2 h-10 px-6 rounded-lg bg-[#16c284] text-sm font-medium text-[#0a0a0b] hover:bg-[#13a872] transition-colors"
      >
        Back to Markets
      </button>
    </div>
  );
}

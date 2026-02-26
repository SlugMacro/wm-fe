import { useNavigate } from 'react-router-dom';
import comingSoonSvg from '../assets/images/coming-soon.svg';

export default function ComingSoonPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-60px)] px-8 py-4">
      <div className="flex flex-col items-center gap-4 max-w-[448px] pt-8 pb-10 px-6">
        {/* Illustration */}
        <img src={comingSoonSvg} alt="" className="size-48" />

        {/* Content */}
        <div className="flex flex-col gap-2 items-center text-center pb-4 px-8 w-full">
          <h1
            className="text-xl font-medium leading-7 text-[#f9f9fa]"
          >
            Coming Soon
          </h1>
          <p
            className="text-sm font-normal leading-5 text-[#b4b4ba] max-w-[280px]"
          >
            This feature is currently under development and will be available soon.
          </p>
        </div>

        {/* Button */}
        <button
          onClick={() => navigate('/markets')}
          className="flex items-center justify-center h-11 rounded-[10px] bg-[#f9f9fa] px-5 text-base font-medium leading-6 text-[#0a0a0b] hover:bg-[#e0e0e2] transition-colors"
        >
          Back to Markets
        </button>
      </div>
    </div>
  );
}

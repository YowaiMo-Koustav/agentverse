
import Link from 'next/link';

const Logo = () => {
  return (
    <Link href="/" className="flex items-center space-x-2 group">
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-300 ease-in-out group-hover:rotate-15 group-hover:scale-110"
      >
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#00F260', stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: '#0575E6', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#F2994A', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        <path
          d="M16 0L30 8V24L16 32L2 24V8L16 0Z"
          fill="url(#logoGradient)"
        />
        <path
          d="M16 4.5L26 10V22L16 27.5L6 22V10L16 4.5Z"
          fill="hsl(var(--background))"
          stroke="hsl(var(--background))"
          strokeWidth="1"
        />
        <path
          d="M16 12L22 15V20L16 23L10 20V15L16 12Z"
          fill="url(#logoGradient)"
        />
      </svg>
      <span className="font-bold text-xl">AgentVerse</span>
    </Link>
  );
};

export default Logo;

const BrandLogo = ({ className = "h-6 w-6" }) => (
  <svg
    aria-hidden="true"
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 6.2v14.3" />
    <path d="M12 7.1c-1.5-1.3-3.4-2-5.5-2H4v13h2.5c2.1 0 4 .7 5.5 2" />
    <path d="M12 7.1c1.5-1.3 3.4-2 5.5-2H20v13h-2.5c-2.1 0-4 .7-5.5 2" />
    <path d="M7 9h2.5M15 9h2" />
  </svg>
);

export default BrandLogo;

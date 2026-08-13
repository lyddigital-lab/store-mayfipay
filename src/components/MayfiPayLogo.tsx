export default function MayfiPayLogo({
  size = 40,
}: {
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background square - MayfiPay Blue */}
      <rect
        x="0.5"
        y="0.5"
        width="39"
        height="39"
        rx="10"
        fill="#0B88E5"
        stroke="#E2E8F0"
        strokeWidth="1"
      />
      {/* Orange corner accent */}
      <path
        d="M31 1L39 1V9L31 9V1Z"
        fill="#F97216"
        transform="rotate(0 35 5)"
      />
      {/* Letter M - white, bold */}
      <path
        d="M10 28 L10 12 L14 12 L18 22 L22 12 L26 12 L26 28"
        fill="#FFFFFF"
        strokeWidth="0"
      />
    </svg>
  );
}

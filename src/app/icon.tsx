import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 48,
  height: 48,
};

export const contentType = 'image/svg+xml';

export default function icon() {
  return new ImageResponse(
    (
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10 4H38C39.1046 4 40 4.89543 40 6V30C40 31.1046 39.1046 32 38 32H28L18 42V32H10C8.89543 32 8 31.1046 8 30V6C8 4.89543 8.89543 4 10 4Z"
          fill="#0060df"
          fillOpacity="0.2"
        />
        <path
          d="M10 4H38C39.1046 4 40 4.89543 40 6V30C40 31.1046 39.1046 32 38 32H28L18 42V32H10C8.89543 32 8 31.1046 8 30V6C8 4.89543 8.89543 4 10 4Z"
          stroke="#0060df"
          strokeWidth="2"
        />
        <path
          d="M20 16L16 20L20 24"
          stroke="#0060df"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M28 16L32 20L28 24"
          stroke="#0060df"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    {
      ...size,
    }
  );
}

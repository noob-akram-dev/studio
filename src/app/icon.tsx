import { ImageResponse } from 'next/og'
 
// Route segment config
export const runtime = 'edge'
 
// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'
 
// Image generation
export default function Icon() {
  return new ImageResponse(
    (
        <div
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#18181b',
            }}
        >
            <svg
                width="32"
                height="32"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M10 4H38C39.1046 4 40 4.89543 40 6V30C40 31.1046 39.1046 32 38 32H28L18 42V32H10C8.89543 32 8 31.1046 8 30V6C8 4.89543 8.89543 4 10 4Z"
                    stroke="#4f46e5" 
                    strokeWidth="2"
                    fill="#4f46e5"
                    fillOpacity="0.2"
                />
                <path
                    d="M20 16L16 20L20 24"
                    stroke="#4f46e5"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M28 16L32 20L28 24"
                    stroke="#4f46e5"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
      </div>
    ),
    {
      ...size,
    }
  )
}

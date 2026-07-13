'use client';

import { useEffect, useRef } from 'react';

export function AdsterraBanner({
  adKey,
  width = 728,
  height = 90,
}: {
  adKey: string;
  width?: number;
  height?: number;
}) {
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bannerRef.current || bannerRef.current.firstChild) return;

    // Set Adsterra options globally
    (window as any).atOptions = {
      key: adKey,
      format: 'iframe',
      height: height,
      width: width,
      params: {},
    };

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = `//www.topcreativeformat.com/${adKey}/invoke.js`;
    script.async = true;

    bannerRef.current.appendChild(script);
  }, [adKey, width, height]);

  return (
    <div className="flex justify-center items-center my-4 overflow-hidden min-h-[90px]">
      <div ref={bannerRef} />
    </div>
  );
}

'use client';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export function CodeBlock({
  language,
  code,
}: {
  language: string;
  code: string;
}) {
  return (
    <div className="font-code text-sm my-2 rounded-md overflow-hidden">
      <SyntaxHighlighter
        language={language.toLowerCase()}
        style={vscDarkPlus}
        showLineNumbers
        wrapLines
        customStyle={{ margin: 0, borderRadius: '0.375rem', padding: '1rem' }}
        codeTagProps={{ style: { fontFamily: 'inherit' } }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

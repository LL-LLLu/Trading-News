"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose prose-stone dark:prose-invert max-w-none
      prose-headings:font-serif prose-headings:text-[#1A1A1A] dark:prose-headings:text-[#F5F5F4]
      prose-p:text-[#374151] dark:prose-p:text-[#D1D5DB] prose-p:leading-relaxed
      prose-a:text-[#0F4C81] dark:prose-a:text-[#5BA3D9]
      prose-strong:text-[#1A1A1A] dark:prose-strong:text-[#F5F5F4]
      prose-code:bg-[#F3F0EB] dark:prose-code:bg-[#2D2D2D] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
      prose-pre:bg-[#1A1A1A] dark:prose-pre:bg-[#0A0A0A] prose-pre:rounded-lg
      prose-img:rounded-lg prose-img:shadow-md
      prose-table:border-collapse prose-th:border prose-th:border-[#E5E0D8] dark:prose-th:border-[#2D2D2D] prose-th:px-3 prose-th:py-2
      prose-td:border prose-td:border-[#E5E0D8] dark:prose-td:border-[#2D2D2D] prose-td:px-3 prose-td:py-2
      prose-blockquote:border-l-[#0F4C81] prose-blockquote:text-[#6B7280]
      prose-li:text-[#374151] dark:prose-li:text-[#D1D5DB]"
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}

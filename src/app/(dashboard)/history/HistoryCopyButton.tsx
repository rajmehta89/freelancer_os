"use client";

import { useState }  from "react";
import { Button }    from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

export function HistoryCopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className="shrink-0 text-gray-500 hover:text-white"
      title="Copy to clipboard"
    >
      {copied
        ? <Check className="h-3.5 w-3.5 text-green-400" />
        : <Copy  className="h-3.5 w-3.5" />
      }
    </Button>
  );
}

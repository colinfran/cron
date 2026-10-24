"use client";

import { useState } from "react";
import { Copy, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);

  async function handleCopy() {
    setError(false);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError(true);
    }
  }

  return (
    <Button
      type="button"
      onClick={handleCopy}
      variant="ghost"
      size="icon-sm"
      aria-label={error ? "Copy failed. Select and copy the text manually." : copied ? "Copied" : "Copy to clipboard"}
      title={error ? "Copy failed. Select and copy the text manually." : "Copy to clipboard"}
    >
      {error ? <AlertCircle className="size-4 text-destructive" /> : copied ? (
        <Check className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );
}

"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function CodeBlock({ code }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);

  const handleCopy = async () => {
    setError(false);
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError(true);
    }
  };

  return (
    <div className="group relative rounded-lg border border-border bg-muted/40">
      <Button
        onClick={handleCopy}
        variant="ghost"
        size="icon-sm"
        aria-label={copied ? "Copied" : "Copy code"}
        className="absolute right-2 top-2"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-primary" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </Button>
      <pre className="overflow-x-auto p-4 pr-12 text-[13px] leading-relaxed">
        <code className="text-foreground/80">{code}</code>
      </pre>
      {error && <p role="alert" className="px-4 pb-3 text-xs text-destructive">Could not copy. Select the code and copy it manually.</p>}
    </div>
  );
}

export function Callout({
  type = "info",
  children,
}: {
  type?: "info" | "warning";
  children: React.ReactNode;
}) {
  const styles = {
    info: "border-primary/20 bg-primary/5",
    warning: "border-yellow-500/20 bg-yellow-500/5",
  };

  return (
    <Alert className={styles[type]}>
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}

export function EndpointBlock({
  method,
  path,
  description,
  auth,
  body,
  response,
  queryParams,
}: {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  description: string;
  auth?: boolean;
  body?: string;
  response?: string;
  queryParams?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-3 border-b border-border px-5 py-3.5">
        <Badge variant="secondary" className="font-mono">{method}</Badge>
        <code className="text-sm font-medium">{path}</code>
        {auth && (
          <span className="ml-auto rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary">
            Auth required
          </span>
        )}
      </div>
      <div className="space-y-4 p-5">
        <p className="text-sm text-muted-foreground">{description}</p>
        {queryParams && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Query Parameters
            </p>
            <CodeBlock code={queryParams} />
          </div>
        )}
        {body && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Request Body
            </p>
            <CodeBlock code={body} />
          </div>
        )}
        {response && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Response
            </p>
            <CodeBlock code={response} />
          </div>
        )}
      </div>
    </div>
  );
}

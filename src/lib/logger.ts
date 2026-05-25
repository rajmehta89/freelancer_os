/**
 * Structured Logger — src/lib/logger.ts
 *
 * Format: [timestamp] [LEVEL] [file] message | { context }
 *
 * Rules:
 * - NEVER log passwords, tokens, API keys, full emails, or user content
 * - Use log.error() for all caught exceptions
 * - Use log.ai() for OpenAI calls (tokens/latency only — never prompt content)
 * - Use log.db() for DB operations (no user data values)
 * - debug() is suppressed in production
 */

type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG" | "HTTP" | "DB" | "AI";

interface LogContext {
  [key: string]: unknown;
}

const isDev = process.env.NODE_ENV === "development";

/** Mask email: user@example.com → use***@***.com */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  const domainParts = domain.split(".");
  const tld = domainParts.pop() ?? "";
  return `${local.slice(0, 3)}***@***.${tld}`;
}

function formatLog(
  level: LogLevel,
  file: string,
  message: string,
  context?: LogContext
): string {
  const timestamp = new Date().toISOString();
  const ctx = context ? ` | ${JSON.stringify(context)}` : "";
  return `[${timestamp}] [${level.padEnd(5)}] [${file}] ${message}${ctx}`;
}

function write(
  level: LogLevel,
  file: string,
  message: string,
  context?: LogContext
) {
  const line = formatLog(level, file, message, context);
  switch (level) {
    case "ERROR":
      console.error(line);
      break;
    case "WARN":
      console.warn(line);
      break;
    case "DEBUG":
      if (isDev) console.debug(line);
      break;
    default:
      console.log(line);
  }
}

export const log = {
  /** Normal operations — user signed in, proposal generated */
  info: (file: string, message: string, context?: LogContext) =>
    write("INFO", file, message, context),

  /** Unexpected but not broken — rate limit approaching, retry */
  warn: (file: string, message: string, context?: LogContext) =>
    write("WARN", file, message, context),

  /** Something failed — DB error, API failure, uncaught exception */
  error: (
    file: string,
    message: string,
    error?: unknown,
    context?: LogContext
  ) => {
    const errCtx: LogContext = {
      ...(context ?? {}),
      ...(error instanceof Error
        ? { errorMessage: error.message, stack: error.stack }
        : { error: String(error) }),
    };
    write("ERROR", file, message, errCtx);
  },

  /** Dev/troubleshooting only — suppressed in production */
  debug: (file: string, message: string, context?: LogContext) =>
    write("DEBUG", file, message, context),

  /** Incoming HTTP requests and responses */
  http: (
    file: string,
    message: string,
    context?: { method?: string; path?: string; status?: number; ms?: number }
  ) => write("HTTP", file, message, context),

  /** DB query logs — never include user-supplied values */
  db: (
    file: string,
    message: string,
    context?: { table?: string; operation?: string; ms?: number }
  ) => write("DB", file, message, context),

  /** AI call logs — model, tokens, latency ONLY. Never log prompt/response content */
  ai: (
    file: string,
    message: string,
    context?: {
      model?: string;
      promptTokens?: number;
      completionTokens?: number;
      ms?: number;
    }
  ) => write("AI", file, message, context),
};

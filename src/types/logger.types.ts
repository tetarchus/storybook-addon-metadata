/** Custom logger utility. */
type Logger = {
  /** Log error messages with prefix. */
  error: (...messages: unknown[]) => void;
  /** Log info messages with prefix. */
  info: (...messages: unknown[]) => void;
  /** Log debug messages with prefix. Only logged if `debug` === `true`. */
  verbose: (...messages: unknown[]) => void;
  /** Log warning messages with prefix. */
  warn: (...messages: unknown[]) => void;
};

export type { Logger };

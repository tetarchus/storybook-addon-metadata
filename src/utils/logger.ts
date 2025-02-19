import { ADDON_ID } from '@/constants';

import type { Logger } from '@/types';

/**
 * Adds the addon name as a prefix to a message.
 * @param msg The string to prefix.
 * @returns The prefixed string.
 */
const injectAddonPrefix = (logName?: string, msg?: string): string =>
  `[${ADDON_ID}${logName ? `: ${logName}` : ''}]: ${msg ?? ''}`.trim();

/** Custom logger for adding addon name to output messages. */
const logger = (debug: boolean, logName?: string): Logger => {
  /**
   * Custom logger that adds the addon name to the logged messages.
   * @param method The console method to use.
   * @param messages The messages to pass to the console method.
   */
  const log = (
    method: Extract<keyof Console, 'error' | 'info' | 'log' | 'warn'>,
    ...messages: unknown[]
  ): void => {
    // eslint-disable-next-line no-console
    console[method](injectAddonPrefix(logName), ...messages);
  };

  return {
    /** Log error messages to the console. */
    error: (...messages: unknown[]) => log('error', ...messages),
    /** Log info messages to the console. */
    info: (...messages: unknown[]) => log('info', ...messages),
    /** Log verbose messages to the console. */
    verbose: (...messages: unknown[]) => debug && log('log', ...messages),
    /** Log warning messages to the console. */
    warn: (...messages: unknown[]) => log('warn', ...messages),
  };
};

/** Simple error formatter for AST errors. */
const unhandledAstError = (name: string, type: string) => `[UNHANDLED - ${name}]: ${type}`;

export { injectAddonPrefix, logger, unhandledAstError };

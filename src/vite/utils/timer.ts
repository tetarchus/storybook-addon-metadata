/**
 * Calculates the elapsed time in seconds between two timestamps from
 * `performance.now()` and formats as a string to 4 decimal places.
 * @param startTime The start time as recorded by `performance.now()`.
 * @param endTime The end time as recorded by `performance.now()`.
 * @returns A formatted string in seconds to 4 decimal places.
 */
const getElapsedTime = (startTime: number, endTime: number): string =>
  `${((endTime - startTime) / 1_000).toFixed(4)}s`;

export { getElapsedTime };

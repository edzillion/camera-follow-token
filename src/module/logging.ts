const MODULE_ID = 'camera-follow-token';

/**
 * Logging
 * @module Logging
 */

export enum LogLevel {
  ERROR,
  INFO,
  DEBUG,
  WARN,
  ALL,
}

/**
 * Simple wrapper around console.log to give us log level functionality.
 * @function
 * @param {LogLevel} messageLevel - ERROR,INFO,DEBUG,WARN,ALL
 * @param {...any} args - console.log() arguments
 */
export function log(messageLevel: LogLevel, ...args: any): void {
  if (messageLevel > CONFIG.cft.logLevel) return;
  if (messageLevel === LogLevel.ERROR) console.error(MODULE_ID + ' | ', ...args);
  else console.log(MODULE_ID + ' | ', ...args);
}

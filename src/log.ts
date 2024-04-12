export type LogLevel = 'error' | 'warn' | 'info' | 'debug';
export const logLevels = ['error', 'warn', 'info', 'debug'];

export const getLogFn = (currentLogLevel) => {
  return function log(message: string, level: string = 'info') {
    const messageLevel = logLevels.indexOf(level.toLowerCase());
    if (messageLevel <= currentLogLevel) {
      console.log(`[${level.toUpperCase()}]: ${message}`);
    }
  };
}


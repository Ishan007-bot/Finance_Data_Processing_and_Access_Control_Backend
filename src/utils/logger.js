const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
};

const formatMessage = (level, message, ...args) => {
  const timestamp = new Date().toISOString();
  const formattedArgs = args.length > 0 ? ' ' + args.join(' ') : '';
  return `[${timestamp}] [${level}] ${message}${formattedArgs}`;
};

const logger = {
  info: (message, ...args) => {
    console.log(formatMessage(LOG_LEVELS.INFO, message, ...args));
  },

  warn: (message, ...args) => {
    console.warn(formatMessage(LOG_LEVELS.WARN, message, ...args));
  },

  error: (message, ...args) => {
    console.error(formatMessage(LOG_LEVELS.ERROR, message, ...args));
  },

  debug: (message, ...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(formatMessage(LOG_LEVELS.DEBUG, message, ...args));
    }
  },
};

module.exports = logger;

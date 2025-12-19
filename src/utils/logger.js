import { SERVER_ENV } from '../config/api';

/**
 * Logger service - Active en dev, désactivé en prod
 *
 * Usage:
 *   import logger from '@/utils/logger';
 *   logger.log('message');
 *   logger.info('info message');
 *   logger.warn('warning message');
 *   logger.error('error message', errorObject);
 *   logger.debug('debug details', data);
 *   logger.group('Group Name');
 *   logger.groupEnd();
 *   logger.table(data);
 */

const isDev = SERVER_ENV !== 'prod';

const noop = () => {};

const logger = {
  log: isDev ? console.log.bind(console) : noop,
  info: isDev ? console.info.bind(console) : noop,
  warn: isDev ? console.warn.bind(console) : noop,
  error: isDev ? console.error.bind(console) : noop,
  debug: isDev ? console.debug.bind(console) : noop,
  group: isDev ? console.group.bind(console) : noop,
  groupEnd: isDev ? console.groupEnd.bind(console) : noop,
  groupCollapsed: isDev ? console.groupCollapsed.bind(console) : noop,
  table: isDev ? console.table.bind(console) : noop,
  time: isDev ? console.time.bind(console) : noop,
  timeEnd: isDev ? console.timeEnd.bind(console) : noop,
  trace: isDev ? console.trace.bind(console) : noop,

  // Méthode pour forcer un log même en prod (erreurs critiques)
  critical: console.error.bind(console),
};

export default logger;

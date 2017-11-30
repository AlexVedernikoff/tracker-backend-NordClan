const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;

const myFormat = printf(info => {
  return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`;
});

const getLabel = function (module) {
  const parts = module.filename.split('/');
  return parts[parts.length - 2] + '/' + parts.pop();
};


module.exports = function (module) {
  const logger = createLogger({
    format: combine(
      label({ label: getLabel(module) }),
      timestamp(),
      myFormat
    ),
    transports: [
      new transports.File({ filename: __dirname + '/cronlogs/error.log', level: 'error', timestamp: true }),
      new transports.File({ filename: __dirname + '/cronlogs/all.log', timestamp: true })
    ]
  });

  if (process.env.NODE_ENV !== 'production') {
    logger.add(new transports.Console());
  }


  return logger;
};

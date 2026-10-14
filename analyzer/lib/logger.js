const { format, createLogger, transports, config } = require("winston");

const { isAgentMode } = require("./agent-mode");

const { combine, timestamp, colorize } = format;
const logger = createLogger({
  level: process.env.DEBUG === "true" ? "debug" : "info",
  format: combine(
    colorize(),
    timestamp(),
    format.printf(
      (info) => `${info.timestamp} - ${info.level}: ${info.message}`,
    ),
  ),
  // In agent mode stdout is reserved for the JSON document, so log to stderr.
  transports: [
    new transports.Console(
      isAgentMode() ? { stderrLevels: Object.keys(config.npm.levels) } : {},
    ),
  ],
  exitOnError: false,
});
module.exports = logger;

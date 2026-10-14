/**
 * Helpers for agent mode, used when checkmate is launched by the Auth0 CLI
 * with AUTH0_AGENT_MODE set. In agent mode stdout carries a single JSON
 * document and all human-oriented output goes to stderr.
 */

/**
 * Agent mode is on when AUTH0_AGENT_MODE is "1" or "true" (case-insensitive).
 * @param {Object} env
 * @returns {boolean}
 */
function isAgentMode(env = process.env) {
  const value = String(env.AUTH0_AGENT_MODE || "").trim().toLowerCase();
  return value === "1" || value === "true";
}

/**
 * The real tenant domain as reported by the Auth0 CLI, falling back to the
 * domain checkmate talks to when the CLI did not provide one.
 * @param {Object} env
 * @param {string} fallback
 * @returns {string}
 */
function resolveTenantDomain(env, fallback) {
  return env.AUTH0_CLI_TENANT_DOMAIN || fallback;
}

/**
 * Domain shown to the user (report filenames, PDF header). API calls keep
 * using config.auth0Domain.
 * @param {Object} config
 * @returns {string}
 */
function getDisplayDomain(config) {
  return config.tenantDomain || config.auth0Domain;
}

/**
 * Build the JSON document written to stdout on success.
 * @param {Object} params
 * @returns {Object}
 */
function buildAgentOutput({ tenant, version, findings, jsonPath, now = new Date() }) {
  return {
    tenant,
    version,
    generatedAt: now.toISOString(),
    findings,
    files: { json: jsonPath },
  };
}

/**
 * Build the JSON document written to stdout on failure.
 * @param {Error|string} err
 * @returns {{error: string}}
 */
function buildAgentError(err) {
  return { error: (err && err.message) || String(err) };
}

/**
 * Write a JSON document to stdout, then exit once it has been flushed.
 * @param {Object} payload
 * @param {number} code
 */
function writeJsonAndExit(payload, code) {
  process.stdout.write(`${JSON.stringify(payload)}\n`, () => process.exit(code));
}

module.exports = {
  isAgentMode,
  resolveTenantDomain,
  getDisplayDomain,
  buildAgentOutput,
  buildAgentError,
  writeJsonAndExit,
};

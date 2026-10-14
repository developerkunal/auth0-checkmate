const { expect } = require("chai");
const {
  isAgentMode,
  resolveTenantDomain,
  getDisplayDomain,
  buildAgentOutput,
  buildAgentError,
} = require("../analyzer/lib/agent-mode");

describe("agent mode helpers", function() {
  describe("isAgentMode", function() {
    const cases = [
      [{ AUTH0_AGENT_MODE: "1" }, true],
      [{ AUTH0_AGENT_MODE: "true" }, true],
      [{ AUTH0_AGENT_MODE: "TRUE" }, true],
      [{ AUTH0_AGENT_MODE: "True" }, true],
      [{ AUTH0_AGENT_MODE: "0" }, false],
      [{ AUTH0_AGENT_MODE: "false" }, false],
      [{ AUTH0_AGENT_MODE: "yes" }, false],
      [{ AUTH0_AGENT_MODE: "" }, false],
      [{}, false],
    ];

    it("matches 1/true case-insensitively and rejects everything else", function() {
      for (const [env, expected] of cases) {
        expect(isAgentMode(env), JSON.stringify(env)).to.equal(expected);
      }
    });
  });

  describe("resolveTenantDomain", function() {
    it("prefers AUTH0_CLI_TENANT_DOMAIN", function() {
      const env = { AUTH0_CLI_TENANT_DOMAIN: "acme.us.auth0.com" };
      expect(resolveTenantDomain(env, "127.0.0.1:1234")).to.equal(
        "acme.us.auth0.com",
      );
    });

    it("falls back to the proxy host when unset or empty", function() {
      expect(resolveTenantDomain({}, "127.0.0.1:1234")).to.equal("127.0.0.1:1234");
      expect(
        resolveTenantDomain({ AUTH0_CLI_TENANT_DOMAIN: "" }, "127.0.0.1:1234"),
      ).to.equal("127.0.0.1:1234");
    });
  });

  describe("getDisplayDomain", function() {
    it("uses tenantDomain when present", function() {
      expect(
        getDisplayDomain({ tenantDomain: "acme.us.auth0.com", auth0Domain: "127.0.0.1:1" }),
      ).to.equal("acme.us.auth0.com");
    });

    it("uses auth0Domain when tenantDomain is absent", function() {
      expect(getDisplayDomain({ auth0Domain: "acme.us.auth0.com" })).to.equal(
        "acme.us.auth0.com",
      );
      expect(
        getDisplayDomain({ tenantDomain: undefined, auth0Domain: "acme.us.auth0.com" }),
      ).to.equal("acme.us.auth0.com");
    });
  });

  describe("buildAgentOutput", function() {
    it("builds the success document", function() {
      const findings = [{ title: "a", severity: "high" }];
      const out = buildAgentOutput({
        tenant: "acme.us.auth0.com",
        version: "1.2.3",
        findings,
        jsonPath: "/tmp/report.json",
        now: new Date("2026-01-02T03:04:05.000Z"),
      });
      expect(out).to.deep.equal({
        tenant: "acme.us.auth0.com",
        version: "1.2.3",
        generatedAt: "2026-01-02T03:04:05.000Z",
        findings,
        files: { json: "/tmp/report.json" },
      });
    });

    it("defaults generatedAt to an ISO timestamp", function() {
      const out = buildAgentOutput({ tenant: "t", version: "1", findings: [], jsonPath: "p" });
      expect(new Date(out.generatedAt).toISOString()).to.equal(out.generatedAt);
    });
  });

  describe("buildAgentError", function() {
    it("uses the error message", function() {
      expect(buildAgentError(new Error("boom"))).to.deep.equal({ error: "boom" });
    });

    it("stringifies non-Error values", function() {
      expect(buildAgentError("bad")).to.deep.equal({ error: "bad" });
    });
  });
});

// Multi-Site Builder System Prompt
// This prompt is automatically prepended to every user prompt when creating sites

export const MULTI_SITE_SYSTEM_PROMPT = `Objective:

Analyze the entire prompt, list every missing or broken function/feature, and implement all front- and back-end components so the platform is fully working, secure, and compliant. Include one-click "GodMode" login, fully functional third-party integrations, daily automated bug/security scans, competitor feature parity without altering core features, and mock data testing. Build and validate end-to-end in one go, with strict success gates.

Global Strict Rules:

- Do not deploy until every feature is implemented, validated, and passes all success gates.
- Users must never leave the platform during connect or account creation flows.
- Execute phases deterministically; each phase must complete and pass gates before advancing.
- Favor free tiers and sandbox/test environments; explicit confirmations for production.
- All buttons and UI actions must be functional and mapped to verified back-end endpoints.
- Use mock data to test the entire platform end-to-end before production rollout.

Integrations Requirements:

Frontend:
- Admin > Integrations page with cards showing: Name, Category, Status (Connected/Not connected/Error), Plan (Free/Trial), Environment (Test/Prod).
- Actions: Connect (one-click), Create Account, Manage, Disconnect.
- Embedded modals for connect and account creation; details drawer for scopes, environment toggles, webhooks, audit logs.
- Accessibility: keyboard navigable, ARIA labels, contrast compliant.

Backend:
- Services: Integrations service, Secrets manager (encrypted storage, rotation/revoke), Audit logger, Webhook relay, Auth gateway.
- Provider adapter interface: connect, verify, disconnect, revoke, health.
- Endpoints:
  - GET /api/integrations/providers
  - POST /api/integrations/:providerId/connect
  - POST /api/integrations/:providerId/create-account/session
  - POST /api/integrations/:connectionId/verify
  - POST /api/integrations/:connectionId/manage
  - POST /api/integrations/:connectionId/disconnect
  - POST /api/integrations/:connectionId/revoke
  - GET /api/integrations/:connectionId/audit and /export
  - POST /api/webhooks/:providerId

Security & Compliance:
- Credentials encrypted (KMS-managed).
- CSP enforced: frame-ancestors restricted to platform domain; sandboxed iframes.
- Audit logs: actor, provider, environment, action, result, error codes, timestamp.
- Rate limits, retries, circuit breakers, graceful degradation.

GodMode Login:
- Add "GodMode" button that logs in a privileged admin session without registration.
- Session is time-bounded, auditable, and disabled by default in production unless explicitly enabled by an admin with multi-step confirmation.
- Audit every GodMode event: actor, timestamp, environment, scopes assumed, and actions taken.

Automated Daily Scans:
- Bug scan function: Daily at fixed time (e.g., 03:00 UTC). Runs static analysis, tests, dependency checks, error trend analysis. Auto-fixes trivial issues, opens tickets for non-trivial fixes, re-runs validation.
- Security scan function: Daily at fixed time (e.g., 02:00 UTC). Runs SAST, DAST, dependency vulnerability checks, secret leakage scans, misconfiguration audits. Auto-applies safe remediations, tickets non-trivial issues.
- Both functions must be idempotent, auditable, and produce compliance reports in Admin > System Health.

Competitor Parity:
- Build competitor feature matrix: onboarding, billing, analytics, automations, integrations, customization, support, performance.
- Suggest features to add that improve parity without changing core objects, APIs, or user journeys.
- Provide list of added features: name, rationale, dependencies, impact, acceptance tests.
- Ensure each suggested feature is optional, isolated behind flags/toggles, and defaults to off until validated.

Acceptance Criteria:
1. Connect completes fully in embedded modal; status updates to Connected; health check passes; audit entry recorded.
2. Create Account runs entirely inside platform; on success returns to details drawer; audit entry recorded.
3. Secrets stored encrypted; rotation and revoke succeed; environment toggles visible.
4. Statuses deterministic: Connected, Not connected, Error; each shows last_verified_at and health indicators.
5. No external navigation occurs; CSP enforced.
6. Accessibility validated; resilience validated.
7. Webhooks signature-validated, idempotent, observable; failures captured in dead-letter queue.
8. Audit logs exportable as CSV with filters.
9. GodMode login functional, audited, and safeguarded.
10. Daily bug/security scans run automatically, fix trivial issues, surface reports, ticket non-trivial issues.
11. Competitor-inspired features integrated via modules/adapters behind toggles, preserving core behavior.
12. Mock data validates all flows end-to-end before production deployment.

Deliverables:
- Admin > Integrations directory, details drawer, embedded modals, health badges.
- Backend services with typed provider adapters and endpoints.
- Three sample providers implemented end-to-end (auth, analytics, messaging).
- Documentation for scopes, environment toggles, webhook setup, credential rotation, audit export, incident recovery.
- GodMode login with safeguards.
- Automated daily bug and security scan functions, schedules, and reports.
- Competitor feature matrix and toggleable feature pack integrated without core changes.
- Mock data suite for full end-to-end testing.
- Runbook: incident response, credential rotation, webhook setup, recovery steps, CI/CD pipeline gates.`;

export const prepareFullPrompt = (userPrompt: string, siteIndex: number): string => {
  return `Site ${siteIndex + 1} Requirements:

${userPrompt}

---

${MULTI_SITE_SYSTEM_PROMPT}`;
};

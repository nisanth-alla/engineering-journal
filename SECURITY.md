# Security Policy

## Reporting a vulnerability

Please do not open a public issue for a security problem. Report it privately to the repository owner so it can be assessed and addressed before disclosure.

If a secret or credential is exposed, revoke it immediately and preserve only the minimum evidence needed for remediation.

## Supported

This is a personal open-source documentation site. Security fixes are prioritized based on severity and maintainer availability. There is no SLA.

## Scope

- Secrets and API keys (must never be committed).
- Dependency vulnerabilities in the build toolchain.
- Anything that executes user-supplied content in an unsafe way.

The site is primarily static content; the main security surface is dependency hygiene and avoiding the disclosure of personal data.

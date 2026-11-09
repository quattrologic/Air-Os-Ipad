# Security policy

## Reporting a vulnerability

Please do not post credentials, personal data, or exploit details in a public issue.
Use GitHub's private vulnerability reporting feature, if enabled, or contact the repository owner privately.

## Local security

Air-OS is an Electron desktop application, not a replacement for operating-system authentication.
Account data is stored locally. Do not commit real account databases, tokens, personal configuration,
certificates, or private keys. Treat third-party AirCard backends as executable code requiring
separate security and license review.

## Publishing checklist

- Run the security workflow and review Dependabot alerts.
- Review the complete git history and release artifacts for credentials and personal data.
- Sign and notarize public installers.
- Verify dependencies and bundled artwork licenses.
- If a secret was committed, revoke/rotate it immediately; deleting the file in a new commit is not sufficient.

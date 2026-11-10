# Security policy — Air-OS iPad

## Reporting a vulnerability

Please do not post credentials, personal data, access URLs or exploit details in a public issue.
Use GitHub's private vulnerability reporting feature, if enabled, or contact the repository owner privately.

## Local security

Air-OS iPad is a browser-based, offline-capable Progressive Web App (PWA), not a bootable OS,
native iPadOS app or replacement for iPadOS authentication. Its MacLock view is a visual
experience, not a security boundary. Local app data is held in browser storage.

The optional Tailscale Serve setup is intended for private Tailnet access. Publishing the
GitHub source must not enable public GitHub Pages, Tailscale Funnel or unrestricted hosting.

Never commit real account databases, OAuth refresh/access tokens, passwords, certificates,
private keys, private Tailnet URLs or personal device data. Spotify OAuth/PKCE tests must
use synthetic credentials and test profiles.

## Publishing checklist

- Run `npm run audit:public`, `npm test`, `npm run build`, `npm run check` and browser CI.
- Review the complete Git history and release artifacts/logs for secrets and private information.
- Review third-party licenses, original images and AI-image-provider terms.
- If a secret has been exposed, revoke/rotate it. Deleting it from the latest commit alone
  does not remove it from Git history.
- Keep any existing Tailscale-based installation and its user data unchanged.

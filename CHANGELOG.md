# Changelog

All notable changes to Seald are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/) · Versioning: [SemVer](https://semver.org/)

## [Unreleased]

## [0.8.0] - 2026-07-31

### Added
- User authentication (Supabase Auth): email + password with confirmation, Google and GitHub social login
- Per-user vault isolation: backend JWT verification (ES256/JWKS), user-scoped queries, RLS backstop
- Sign-in, register, and email-confirmation callback screens
- Vault health summary in the left panel (weak/reused/no-backup counts + score)

### Changed
- README overhauled to reflect the authenticated multi-user architecture

## [Released]

## [0.7.0] - 2026-07-31

### Added
- Vault health summary: score, weak/reused/missing-backup-code counts in the left panel

### Changed
- Sites data lifted into a shared VaultContext (single fetch, consumed by dashboard and summary)

## [0.6.0] - 2026-07-31

### Added
- Per-route page titles (e.g. "Your vault · Seald")

## [0.5.0] - 2026-07-31

### Added
- Live password strength meter (typed and generated) via @zxcvbn-ts
- Generate-backup-codes button on the site form
- Password generator options: length slider and symbols toggle
- Unsaved-changes confirmation when leaving the form

### Changed
- Migrated to React Router data router (createBrowserRouter) to support navigation blocking

## [0.4.0] - 2026-07-31

### Changed
- README.md file modified with installation steps

## [0.3.0] - 2026-07-31

### Added
- Two-panel layout with brand panel and vault summary (total sites)
- Seald logo and favicon

### Changed
- Dialog action buttons spacing via scoped theme override

## [0.2.0] - 2026-07-31

### Added
- Vault entries persist to Supabase (sites table migration, service-role client)

### Changed
- Storage moved behind a repository interface (in-memory backend retained for tests)

## [0.1.0] - 2026-07-31

### Added
- FastAPI backend: password generator, backup-code generator, sites CRUD (in-memory)
- Encryption at rest for vault secrets (Fernet, key rotation ready)
- React SPA: dashboard, add/edit/remove sites, generate-password integration
- Docker setup for both services; nginx serving + API proxy
- CI: ruff, mypy, pytest, frontend build; Slack notifications
- Branch protection with required PR + green checks
# Changelog

All notable changes to Seald are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/) · Versioning: [SemVer](https://semver.org/)

## [Unreleased]

## [0.4.0] - 2026-07-31

### Changed
- README.md file modified with installation steps

## [Released]

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
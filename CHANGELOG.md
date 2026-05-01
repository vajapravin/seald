# Changelog

All notable changes to Seald are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/) · Versioning: [SemVer](https://semver.org/)

## [Unreleased]

## [0.1.0] - 2026-07-31

### Added
- FastAPI backend: password generator, backup-code generator, sites CRUD (in-memory)
- Encryption at rest for vault secrets (Fernet, key rotation ready)
- React SPA: dashboard, add/edit/remove sites, generate-password integration
- Docker setup for both services; nginx serving + API proxy
- CI: ruff, mypy, pytest, frontend build; Slack notifications
- Branch protection with required PR + green checks
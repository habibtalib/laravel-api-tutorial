# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repository Is

This is a **training-materials repository**, not a runnable Laravel application. It contains a 5-day Laravel API course: Markdown tutorials, reveal.js HTML slides, and copyable code snippets. There is no `composer.json`, `vendor/`, or bootable app at the root — the code under `examples/` is meant to be copied into a *separately created* Laravel project.

## Repository Structure

The repo is mirrored in two languages, and the two trees must stay structurally in sync:

- **English (root):** `training/`, `slides/`, `examples/`
- **Bahasa Malaysia:** `bahasa-malaysia/training/`, `bahasa-malaysia/slides/`, `bahasa-malaysia/examples/`

Each tree contains the same set of files:
- `training/*.md` — daily tutorials (`day-1` … `day-5`), `overview.md`, `react-client-api-setup.md`, and `bonus-*.md` modules.
- `slides/laravel-api-training.html` — a single self-contained reveal.js deck (assets in `slides/vendor/reveal/`).
- `examples/<module>/` — code snippets for each day/bonus module, plus a `react-client-api-consumer/` Vite app.

## How the Examples Work

Each `examples/<module>/` folder is **not** a full Laravel project. It mirrors the file paths *inside* a fresh Laravel app (conventionally named `abc-api`) so learners can copy files into place. A folder typically contains:
- `app/`, `routes/api.php`, `database/migrations/`, `config/env.*.example`, `bootstrap/app.php` — partial Laravel files at their real destination paths.
- `snippets/` — runnable helpers: `curl-*.sh` (test endpoints), `tinker-*.php` (seed data via `php artisan tinker`), `run-tests.sh`.
- `README.md` — setup steps and a table mapping each example file to its Laravel destination path.

To actually run an example, follow its README: `composer create-project laravel/laravel abc-api`, `php artisan install:api`, copy the files in, then `php artisan migrate` / `serve`. The `examples/react-client-api-consumer/` app is a real Vite project (`npm install`, `npm run dev`).

## Conventions to Preserve

These run consistently through every tutorial and example — match them when editing or adding content:

- **Code stays in English in both language trees.** Only prose (explanations, objectives, labs, slide narration) is localized to Bahasa Malaysia. Laravel/PHP/route/class/config/DB field names remain English so snippets stay copyable across both trees.
- **API versioning:** controllers live under `app/Http/Controllers/Api/V1/`; routes use `Route::prefix('v1')->name('api.v1.')`.
- **Running domain model:** the course builds incrementally around `UserProfile` (and later `Project`) models, a `user_profiles` table, and standard JSON envelopes (`{ "message": ..., "data": ... }`).
- **Course progression is cumulative:** Day N assumes Day N-1's code. Day 3 adds Sanctum auth, Day 4 adds caching/eager-loading/exception handling, Day 5 adds the service layer + API Resources. Keep changes consistent with where a concept is introduced.

## Editing Rules

- **Any change to an English file must be reflected in its `bahasa-malaysia/` counterpart** (and vice versa), keeping file structure and code identical while localizing prose.
- When adding/renaming a training file, example file, or slide section, update the corresponding `README.md` index entries (root `README.md`, and the affected `examples/<module>/README.md`).
- Slides are a single hand-maintained HTML file per language — edit `laravel-api-training.html` directly; there is no build step.

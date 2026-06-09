# Laravel API Training Materials

This repository contains a 5-day, 6-hours-per-day Laravel API training package based on the concepts from `Building Better APIs with Laravel`, expanded with complete classroom tutorials, examples, slides, diagrams, React client integration, and bonus modules.

The training is available in English and Bahasa Malaysia.

## Quick Start

Open the course overview first:

- English: `training/overview.md`
- Bahasa Malaysia: `bahasa-malaysia/training/overview.md`

Open the slide decks in a browser:

- English slides: `slides/laravel-api-training.html`
- Bahasa Malaysia slides: `bahasa-malaysia/slides/laravel-api-training.html`

Use the examples while teaching or doing the labs:

- English examples: `examples/`
- Bahasa Malaysia examples: `bahasa-malaysia/examples/`

## Course Structure

| Day | Main topic | Deliverable |
| --- | --- | --- |
| Day 1 | Laravel API foundations and React client shell | First versioned API endpoint plus basic React setup |
| Day 2 | RESTful routes, CRUD, validation, and React forms | User profile CRUD API consumed from React |
| Day 3 | API security and React authentication flow | Sanctum auth, token expiry, token abilities, frontend token middleware, throttling, React login |
| Day 4 | Performance, exception handling, and React API UX | Cached/eager-loaded API with JSON errors and React loading/search states |
| Day 5 | Service layer, API resources, and final integration | Production-style API contract consumed by the React client |

## Training Files

English:

- `training/day-1-laravel-api-foundations.md`
- `training/day-2-restful-routes-validation.md`
- `training/day-3-api-security.md`
- `training/day-4-performance-exception-handling.md`
- `training/day-5-service-layer-final-project.md`
- `training/react-client-api-setup.md`

Bahasa Malaysia:

- `bahasa-malaysia/training/day-1-laravel-api-foundations.md`
- `bahasa-malaysia/training/day-2-restful-routes-validation.md`
- `bahasa-malaysia/training/day-3-api-security.md`
- `bahasa-malaysia/training/day-4-performance-exception-handling.md`
- `bahasa-malaysia/training/day-5-service-layer-final-project.md`
- `bahasa-malaysia/training/react-client-api-setup.md`

## Bonus Modules

English:

- `training/bonus-tdd-laravel-api.md`
- `training/bonus-swagger-openapi.md`
- `training/bonus-filamentphp-admin-api.md`
- `training/bonus-gsd-claude-code-prompts.md`

Bahasa Malaysia:

- `bahasa-malaysia/training/bonus-tdd-laravel-api.md`
- `bahasa-malaysia/training/bonus-swagger-openapi.md`
- `bahasa-malaysia/training/bonus-filamentphp-admin-api.md`
- `bahasa-malaysia/training/bonus-gsd-claude-code-prompts.md`

## Example Projects

Core examples:

- `examples/full-working-laravel-react-app` - complete runnable Laravel backend plus React frontend
- `examples/complete-laravel-react-project`
- `bahasa-malaysia/examples/complete-laravel-react-project`
- `examples/day-1-laravel-api-foundations`
- `examples/day-2-restful-routes-validation`
- `examples/day-3-api-security`
- `examples/day-4-performance-exception-handling`
- `examples/day-5-service-layer-final-project`

React client example:

- `examples/react-client-api-consumer`
- `bahasa-malaysia/examples/react-client-api-consumer`

Bonus examples:

- `examples/bonus-tdd-laravel-api`
- `examples/bonus-swagger-openapi`
- `examples/bonus-filamentphp-admin-api`

## Recommended Teaching Flow

1. Start with the overview.
2. Present the matching slide section.
3. Walk through the daily Markdown tutorial.
4. Copy or compare code from the matching `examples/` folder.
5. Run API requests and inspect the JSON responses with an API client or the React/Vite client.
6. End each day with the review checklist and lab exercise.

## Local Tools

Recommended tools for participants:

- PHP 8.2 or newer.
- Composer.
- Laravel.
- MySQL 8.0 or newer.
- Node.js LTS and npm.
- Git.
- Postman, Insomnia, or another API client.
- Code editor.

## Notes

- Laravel, PHP, route, class, config, and database field names are kept in English so code examples remain copyable.
- The Bahasa Malaysia folder localizes the explanation, objectives, labs, and slide content.
- The React client is a training client for learning how a browser app calls the REST API; production frontend security should be reviewed separately.

# Repository Guidelines

## Project Structure

Repo Radar is a static, browser-only GitHub dashboard. Edit the deployable source directly in `dist/`. `index.html` defines the dashboard and connection dialog, `app.js` handles data fetching and rendering, `style.css` provides responsive styles, and `theme.js` manages the theme toggle. The demo data lives in `dist/app.js`. Regression tests live in `tests/repositories.cjs`. The hosting configuration in `.openai/hosting.json` points to `dist/`.

## Development Commands

Run these commands from the repository root. Development uses Node.js, npm, and Python 3, with no package dependencies or build step.

- `npm run dev` serves `dist/` at `http://localhost:5173`. The demo workspace opens without credentials.
- `npm run check` syntax-checks `dist/app.js` and runs the repository regression checks.

## Coding Style

Use plain browser JavaScript, HTML, and CSS. Follow the surrounding indentation and keep formatting edits local. Use camelCase for JavaScript functions and variables, such as `githubHost`, and kebab-case for HTML IDs and CSS classes, such as `connection-form`. Update JavaScript selectors when changing markup IDs. The repository has no configured formatter or linter.

## Testing

Run `npm run check` before submitting. Add repository-fetching regressions to `tests/repositories.cjs` using Node's strict assertions and the existing mocked DOM and `fetch`. Cover changed behavior and relevant failure cases. There is no configured coverage threshold. For UI changes, check the affected flow in the browser at desktop and narrow widths.

## Commits and Pull Requests

Use short, imperative commit subjects, such as “Add GitHub Enterprise domain support.” In pull requests, describe the user-facing change, report the checks you ran, and link any relevant issue. Include screenshots for visible changes.

## Credentials and Configuration

Keep GitHub tokens in memory and send them only to the selected HTTPS API host. Use dummy credentials and mock hosts in tests. Verify Enterprise connectivity from an authorised browser when live testing is needed, since VPN access, certificate trust, and CORS depend on the instance.

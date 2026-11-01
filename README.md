# Repo Radar
A responsive, single-page GitHub repository dashboard. No dependencies or build step.

Run `npm run dev`, then visit http://localhost:5173. The initial workspace contains clearly labeled demo data. Connect using a GitHub username for public repositories or a personal access token for repositories accessible to that token. Tokens stay in JavaScript memory, are sent only to GitHub, and disappear when the page reloads. No credentials or repository data are persisted.

The dashboard includes description, open issues (excluding pull requests), remaining open milestones, repository updated date, and visibility. Search, sort, filter, and refresh are supported. Repository names open their GitHub home pages in a new tab. Summary counts cover all loaded repositories; filters apply to the table. Activity means GitHub's repository updatedAt/updated_at, not the latest event across every issue or discussion. Pagination includes all available repositories and counts. Public API limits can prevent loading counts; these appear as unavailable, never as zero.

For private repositories, create a fine-grained personal access token with Metadata, Issues and Pull requests read access on selected repositories. Organization policy or SSO can restrict access. Authenticated repository discovery uses all pages of the REST /user/repos endpoint with all affiliations and visibility. Counts are fetched independently in GraphQL batches; unavailable counts never remove repositories. Public browsing uses REST. New connections reset search and visibility filters. Failed connections keep the dialog open with an explicit error.

OAuth sign-in is not included: this requires registering a GitHub OAuth App and adding a server callback with secure session cookies. No OAuth client secret should be placed in this static site. This version is already generic for any user with a username or token.

Check: `npm run check`.

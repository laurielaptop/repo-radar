# Repo Radar
A responsive, single-page GitHub repository dashboard. No dependencies or build step.

Run `npm run dev`, then visit http://localhost:5173. The initial workspace contains clearly labeled demo data. Connect using a GitHub username for public repositories or a personal access token for repositories accessible to that token. Tokens stay in JavaScript memory, are sent only to GitHub, and disappear when the page reloads. No credentials or repository data are persisted.

The dashboard includes description, open issues (excluding pull requests), remaining open milestones, repository updated date, and visibility. Search, sort, filter, and refresh are supported. Repository names open their GitHub home pages in a new tab. Summary counts cover all loaded repositories; filters apply to the table. Activity means GitHub's repository updatedAt/updated_at, not the latest event across every issue or discussion. Pagination includes all available repositories and counts. Public API limits can prevent loading counts; these appear as unavailable, never as zero.

For private repositories, create a fine-grained personal access token with Metadata, Issues and Pull requests read access on selected repositories. Organization policy or SSO can restrict access. Authenticated repository discovery uses all pages of the REST /user/repos endpoint with all affiliations and visibility. Counts are fetched independently in GraphQL batches; unavailable counts never remove repositories. Public browsing uses REST. New connections reset search and visibility filters. Failed connections keep the dialog open with an explicit error.

OAuth sign-in is not included: this requires registering a GitHub OAuth App and adding a server callback with secure session cookies. No OAuth client secret should be placed in this static site. This version is already generic for any user with a username or token.

Check: `npm run check`.

Use **Sign out of GitHub** to clear the in-memory token, account fields, loaded repositories and filters, and return to the sample workspace. This disconnects the dashboard; it does not revoke the token or sign you out of github.com or the separate ChatGPT site-access gate. The control is briefly disabled during a fetch so an in-flight result cannot restore a signed-out workspace.

## GitHub Enterprise

In **Connect GitHub**, enter the optional **GitHub domain**, such as `github.company.com` (or `https://github.company.com`). Leave it blank for GitHub.com, including organisations using Enterprise Cloud on github.com. Enter only the web domain, not an organisation/repository URL or API path. HTTPS and optional custom ports are supported.

GitHub Enterprise Server requests use `https://HOST/api/v3` for REST and `https://HOST/api/graphql` for GraphQL. Enterprise Cloud domains such as `company.ghe.com` use `https://api.company.ghe.com`. The token creation link and connection indicator follow the selected host. Use a personal access token issued by that instance, with repository read permissions allowed by your organisation; supported token types vary by server version and policy.

The client browser must be able to reach the API (including any VPN), trust its HTTPS certificate, and make cross-origin API requests from the dashboard's origin (CORS). Network access alone may not be sufficient. If the organisation blocks browser API access, an administrator must allow it or arrange an approved same-origin deployment/proxy. There is no backend proxy in this project. Failed requests explain these requirements; unavailable counts remain marked as unavailable.

Tokens are sent only to the selected API host; redirects are rejected. Domain, token and repositories remain in memory and are reset by sign out/reload. Changing hosts requires submitting the connection form with that host's token or a public username. Enterprise routing is covered by mocked regression tests; a live organisation server still needs an end-to-end connection check from an authorised client machine.

API references: [Enterprise Server GraphQL endpoint](https://docs.github.com/en/enterprise-server@3.20/graphql/guides/forming-calls-with-graphql#the-graphql-endpoint), [GitHub REST API](https://docs.github.com/en/rest/using-the-rest-api/getting-started-with-the-rest-api).

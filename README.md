# Public search + HTTP fetch for DeepSeek Harness

Personal fork of [hy-sde/dsh-web-search-public](https://github.com/hy-sde/dsh-web-search-public), based on upstream `c980b4c` (0.2.1-alpha.4). Distributed on GitHub only.

Installing this bundle automatically selects:

| Operation | Provider |
| --- | --- |
| `web_search` | `public`: Startpage, DuckDuckGo, Ecosia, Google, Mojeek |
| `web_fetch` | `http`: direct public HTTP(S) retrieval |

The bundle enables the shipped HTTP provider and disables `web-search-deepseek` and `web-deepseek-api`. DeepSeek chat models and account credentials are unaffected. The standard DSH web profile already enables `web_fetch` in its chat toolsets; this bundle preserves that layout.

All configuration is in **this plugin's `cordis.patch.yml`**, applied through the official DSH bundle mechanism. No harness source edits, startup monkey patches, or per-request configuration writes.

## Install or replace the upstream package

Requires DSH **0.2.1-rc.2** (the version validated by this fork), Node.js 22.19+, and pnpm.

If upstream is already installed, remove it first to avoid registering the same `web-search-public` entry twice:

```sh
dsh plugin --profile web remove @hy-sde-org/dsh-web-search-public
```

Paste `https://github.com/averyjohnkucan-arch/dsh-web-search-public` into DSH **Plugins → Add plugin**. The default branch includes built assets, so installation requires no source build.

Or install the built release:

```sh
dsh plugin --profile web add https://github.com/averyjohnkucan-arch/dsh-web-search-public/releases/download/v0.2.2/averyjohnkucan-arch-dsh-web-search-public-0.2.2.tgz
```

Restart DSH to load the new bundle. `dsh --profile web --dump-config` should show `web.config.searchProvider: public`, `web.config.fetchProvider: http`, the HTTP provider enabled, and both DeepSeek web entries disabled. If your profile or home override explicitly selects another provider, reset that override through DSH settings: user overrides intentionally take precedence over bundles.

For a source install, run `npm ci && npm test && npm run check && npm pack`, then pass the resulting `.tgz` to `dsh plugin --profile web add`. Use the release archive rather than a bare GitHub repository URL: compiled output is included in the archive.

## Why this fixes the conflict

Cordis entry patches replace the whole `config` object. Upstream sets only `searchProvider`, which removes the base bundle's `fetchProvider: http`. With both HTTP and DeepSeek Fetch registered, DSH correctly refuses an ambiguous choice. This fork supplies both selections and disables the unused DeepSeek web providers.

Search engine behavior is unchanged. HTTP fetching does not execute JavaScript, and public search engines can still rate limit or block requests. No automatic fallback to DeepSeek is enabled.

To return to upstream, remove `@averyjohnkucan-arch/dsh-web-search-public` and reinstall the upstream package. Bundle defaults disappear on removal; manual profile overrides remain yours.

## Development

```sh
npm ci
npm run check
npm test
npm run build
npm run lint:package
npm pack
```

Tests cover upstream search behavior and the fork's provider selection using the actual Cordis patch algorithm and DSH web service, including the original ambiguous-fetch failure.

Original implementation and licensing details: [upstream documentation](UPSTREAM_README.md), [MIT license](LICENSE), and [third-party notices](THIRD-PARTY-NOTICES.md).

See [COMPATIBILITY.md](COMPATIBILITY.md) for supported DSH versions and upgrade checks.

import { readFileSync } from 'node:fs'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { load } from 'js-yaml'
import { Context } from '@deepseek-ai/cordis'
import { applyEntryPatches, type PatchOptions } from '@deepseek-ai/cordis-plugin-include'
import type { EntryOptions } from '@deepseek-ai/cordis-plugin-loader'
import WebRuntime from '@deepseek-ai/dsh-web'
import type { WebFetchResult } from '@deepseek-ai/dsh-web'

const patches = load(readFileSync(new URL('../cordis.patch.yml', import.meta.url), 'utf8')) as PatchOptions[]
const base: EntryOptions[] = [
  { id: 'web', name: '@deepseek-ai/dsh-web', config: { searchProvider: 'deepseek-official', fetchProvider: 'http' } },
  { id: 'web-search-deepseek', name: '@deepseek-ai/dsh-web-search-deepseek' },
  { id: 'web-deepseek-api', name: '@deepseek-ai/dsh-web-deepseek-api' },
  { id: 'web-fetch-http', name: '@deepseek-ai/dsh-web-fetch-http', disabled: true },
  { id: 'tool-web', name: '@deepseek-ai/dsh-tool-web', config: { fetch: true, searchTimeoutMs: 60000 } },
  { id: 'llm-deepseek', name: '@deepseek-ai/dsh-llm-deepseek' },
]

function compose() {
  const warn = vi.fn()
  const entries = applyEntryPatches(base, patches, warn)
  expect(warn).not.toHaveBeenCalled()
  return entries
}

afterEach(() => vi.unstubAllEnvs())

describe('fork installation bundle', () => {
  it('selects both providers using Cordis patch semantics, preserving the chat tools and model', () => {
    const entries = compose()
    expect(entries.find(e => e.id === 'web')?.config).toEqual({ searchProvider: 'public', fetchProvider: 'http' })
    expect(entries.find(e => e.id === 'web-fetch-http')?.disabled).toBe(false)
    expect(entries.find(e => e.id === 'web-search-deepseek')?.disabled).toBe(true)
    expect(entries.find(e => e.id === 'web-deepseek-api')?.disabled).toBe(true)
    expect(entries.find(e => e.id === 'tool-web')).toEqual(base.find(e => e.id === 'tool-web'))
    expect(entries.find(e => e.id === 'llm-deepseek')).toEqual(base.find(e => e.id === 'llm-deepseek'))
    const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
    expect(entries.find(e => e.id === 'web-search-public')?.name).toBe(pkg.name)
    // Include must not bake these choices into the cached base tree on reload.
    expect(base[0]?.config.fetchProvider).toBe('http')
    expect(base[0]?.config.searchProvider).toBe('deepseek-official')
  })

  it('reproduces upstream ambiguity and fixes it even if another plugin registers DeepSeek again', async () => {
    vi.stubEnv('DSH_WEB_FETCH_PROVIDER', undefined)
    const upstream = applyEntryPatches(base, [{ id: 'web', config: { searchProvider: 'public' } }], vi.fn())
    const page: WebFetchResult = { url: 'https://example.com/', statusCode: 200, body: { kind: 'text', content: 'HTTP page' }, truncated: false }
    for (const [config, broken] of [[upstream[0]?.config, true], [compose()[0]?.config, false]] as const) {
      const ctx = new Context()
      const fiber = await ctx.plugin(WebRuntime, config)
      const http = vi.fn(async () => page)
      const deepseek = vi.fn(async () => page)
      ctx.web.registerFetchProvider({ id: 'deepseek-fetch-api', available: () => true, fetch: deepseek })
      ctx.web.registerFetchProvider({ id: 'http', available: () => true, fetch: http })
      try {
        if (broken) {
          await expect(ctx.web.fetch({ url: page.url })).rejects.toMatchObject({ code: 'WEB_PROVIDER_AMBIGUOUS' })
        } else {
          await expect(ctx.web.fetch({ url: page.url })).resolves.toEqual(page)
          expect(http).toHaveBeenCalledOnce()
        }
        expect(deepseek).not.toHaveBeenCalled()
      } finally { await fiber.dispose() }
    }
  })

  it('keeps search on public and never falls back to DeepSeek on a provider failure', async () => {
    const ctx = new Context()
    const fiber = await ctx.plugin(WebRuntime, compose()[0]?.config)
    const result = { sources: [{ url: 'https://example.com/', title: 'Public result' }], truncated: false }
    const publicSearch = vi.fn(async () => result)
    const deepseek = vi.fn(async () => result)
    ctx.web.registerSearchProvider({ id: 'public', available: () => true, search: publicSearch })
    ctx.web.registerSearchProvider({ id: 'deepseek-official', available: () => true, search: deepseek })
    try {
      await expect(ctx.web.search({ query: 'example' })).resolves.toEqual(result)
      publicSearch.mockRejectedValueOnce(new Error('Engine timeout'))
      await expect(ctx.web.search({ query: 'example' })).rejects.toThrow('Engine timeout')
      expect(deepseek).not.toHaveBeenCalled()
    } finally { await fiber.dispose() }
  })
})

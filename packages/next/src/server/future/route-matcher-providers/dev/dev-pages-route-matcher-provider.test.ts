import { PagesRouteDefinition } from '../../route-definitions/pages-route-definition'
import { RouteKind } from '../../route-kind'
import { DevPagesRouteMatcherProvider } from './dev-pages-route-matcher-provider'
import { FileReader } from './helpers/file-reader/file-reader'

describe('DevPagesRouteMatcherProvider', () => {
  const dir = '<root>'
  const extensions = ['ts', 'tsx', 'js', 'jsx']

  it('returns no routes with an empty filesystem', async () => {
    const reader: FileReader = { read: jest.fn(() => []) }
    const matcher = new DevPagesRouteMatcherProvider(dir, extensions, reader)
    const matchers = await matcher.matchers()
    expect(matchers).toHaveLength(0)
    expect(reader.read).toBeCalledWith(dir)
  })

  describe('filename matching', () => {
    it.each<{
      files: ReadonlyArray<string>
      route: PagesRouteDefinition
    }>([
      {
        files: [`${dir}/index.ts`],
        route: {
          kind: RouteKind.PAGES,
          pathname: '/',
          isDynamic: false,
          filename: `${dir}/index.ts`,
          page: '/',
          bundlePath: 'pages/index',
        },
      },
      {
        files: [`${dir}/some/api/route.ts`],
        route: {
          kind: RouteKind.PAGES,
          pathname: '/some/api/route',
          isDynamic: false,
          filename: `${dir}/some/api/route.ts`,
          page: '/some/api/route',
          bundlePath: 'pages/some/api/route',
        },
      },
      {
        files: [`${dir}/some/other/route/index.ts`],
        route: {
          kind: RouteKind.PAGES,
          pathname: '/some/other/route',
          isDynamic: false,
          filename: `${dir}/some/other/route/index.ts`,
          page: '/some/other/route',
          bundlePath: 'pages/some/other/route',
        },
      },
      {
        files: [`${dir}/some/other/route/index/route.ts`],
        route: {
          kind: RouteKind.PAGES,
          pathname: '/some/other/route/index/route',
          isDynamic: false,
          filename: `${dir}/some/other/route/index/route.ts`,
          page: '/some/other/route/index/route',
          bundlePath: 'pages/some/other/route/index/route',
        },
      },
    ])(
      "matches the '$route.page' route specified with the provided files",
      async ({ files, route }) => {
        const reader: FileReader = {
          read: jest.fn(() => [
            ...extensions.map((ext) => `${dir}/api/other/page.${ext}`),
            ...files,
          ]),
        }
        const matcher = new DevPagesRouteMatcherProvider(
          dir,
          extensions,
          reader
        )
        const matchers = await matcher.matchers()
        expect(matchers).toHaveLength(1)
        expect(reader.read).toBeCalledWith(dir)
        expect(matchers[0].definition).toEqual(route)
      }
    )
  })
})

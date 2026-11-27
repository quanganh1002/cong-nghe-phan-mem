/**
 * Bản Markdown của các trang cho AI agent (gửi `Accept: text/markdown`, xem proxy.ts) và /llms.txt.
 * Dựng từ cùng dữ liệu với trang HTML nên tự cập nhật khi thêm món.
 */
import { DISHES, type Dish } from "./dishes.ts"
import { GLOSSARY } from "./glossary.ts"

export const SITE_URL = "https://viviet.vercel.app"
export const SITE_NAME = "Vị Việt"
export const SITE_DESCRIPTION =
  "Vị Việt (Vi Viet) is a free multilingual audio guide to traditional Vietnamese dishes and food culture: the origin, cultural meaning, ingredients and eating tips of each dish, narrated in 10 languages."

const REGION: Record<Dish["region"], string> = { north: "Northern Vietnam", central: "Central Vietnam", south: "Southern Vietnam" }

/** Trang tổng quan, theo định dạng llms.txt (https://llmstxt.org): H1, blockquote, các mục H2 là danh sách link. */
/** `all`: món từ database (listDishes); mặc định là món có sẵn trong mã nguồn */
export function indexMarkdown(all: Dish[] = DISHES): string {
  const dishes = all.map((d) => `- [${d.vi.name} (${d.en.name})](${SITE_URL}/dishes/${d.id}): ${d.en.summary}`)
  return `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

Every page is available as Markdown: request it with the header \`Accept: text/markdown\`. Dish text is written by hand in Vietnamese and English; the other 8 languages are machine-translated. There is no public API, login or ordering.

## Pages

- [Home](${SITE_URL}/): introduction and featured dishes
- [All dishes](${SITE_URL}/dishes): searchable list, filters \`?region=north|central|south\`, \`?cat=main|snack|drink|dessert|festival\`, \`?q=\`
- [Food map](${SITE_URL}/map): where each dish comes from
- [Glossary](${SITE_URL}/glossary): common Vietnamese food words
- [About](${SITE_URL}/about): about the project

## Dishes

${dishes.join("\n")}

## Optional

- [Sitemap](${SITE_URL}/sitemap.xml)
`
}

export function dishMarkdown(d: Dish): string {
  const section = (t: Dish["en"], lang: string) => `## ${lang}: ${t.name}

${t.summary}

### Origin

${t.origin}

### Culture

${t.culture}

### Ingredients

${t.ingredients}

### How to enjoy it

${t.tip}
`
  return `# ${d.vi.name} (${d.en.name})

Region: ${REGION[d.region]}. Category: ${d.category}. Page: ${SITE_URL}/dishes/${d.id}

${section(d.en, "English")}
${section(d.vi, "Tiếng Việt")}
[All dishes](${SITE_URL}/llms.txt)
`
}

export function glossaryMarkdown(): string {
  const terms = GLOSSARY.map((g) => `- **${g.term}** (${g.en.name}): ${g.en.desc}`)
  return `# ${SITE_NAME} glossary

Common words in Vietnamese cooking, with their English meaning.

${terms.join("\n")}

[Site index](${SITE_URL}/llms.txt)
`
}

export function notFoundMarkdown(path: string): string {
  return `# 404 Not Found

There is no page at \`${path}\` on ${SITE_NAME}. See the [site index](${SITE_URL}/llms.txt) for every dish and page, or the [sitemap](${SITE_URL}/sitemap.xml).
`
}

/** Markdown cho một đường dẫn; null nếu trang không tồn tại. */
export function pageMarkdown(path: string, dishes: Dish[] = DISHES): string | null {
  if (path === "/glossary") return glossaryMarkdown()
  if (["/", "/dishes", "/map", "/about"].includes(path)) return indexMarkdown(dishes)
  const m = path.match(/^\/dishes\/([^/]+)$/)
  const id = m && decodeURIComponent(m[1])
  const dish = id && dishes.find((d) => d.id === id)
  return dish ? dishMarkdown(dish) : null
}

/** Response Markdown (200, hoặc 404 cho trang không tồn tại) nếu khách xin Markdown; null thì để Next trả HTML. */
export function markdownResponse(path: string, accept: string, dishes: Dish[] = DISHES): Response | null {
  if (!wantsMarkdown(accept)) return null
  const md = pageMarkdown(path, dishes)
  return new Response(md ?? notFoundMarkdown(path), {
    status: md ? 200 : 404,
    headers: { "Content-Type": "text/markdown; charset=utf-8", Vary: "Accept" },
  })
}

/** Khách muốn Markdown khi text/markdown có q > 0 và không thấp hơn text/html. */
export function wantsMarkdown(accept: string): boolean {
  const q = (type: string) => {
    for (const part of accept.toLowerCase().split(",")) {
      const [t, ...params] = part.split(";").map((s) => s.trim())
      if (t !== type) continue
      const qp = params.find((p) => p.startsWith("q="))
      return qp ? Number(qp.slice(2)) || 0 : 1
    }
    return 0
  }
  const md = q("text/markdown")
  return md > 0 && md >= q("text/html")
}

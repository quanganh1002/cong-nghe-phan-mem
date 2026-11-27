// Chạy: pnpm test (node --test, Node 22.6+)
import { test } from "node:test"
import assert from "node:assert/strict"
import { indexMarkdown, markdownResponse, pageMarkdown, wantsMarkdown } from "../lib/agent-markdown.ts"
import { DISHES } from "../lib/dishes.ts"

const call = (path: string, accept: string) => markdownResponse(path, accept)!

test("wantsMarkdown đọc header Accept", () => {
  assert.equal(wantsMarkdown("text/markdown"), true)
  assert.equal(wantsMarkdown("text/markdown, text/html;q=0.9"), true)
  assert.equal(wantsMarkdown("text/html,application/xhtml+xml,*/*;q=0.8"), false)
  assert.equal(wantsMarkdown("text/html, text/markdown;q=0.5"), false)
  assert.equal(wantsMarkdown("text/markdown;q=0"), false)
  assert.equal(wantsMarkdown(""), false)
})

test("trang chủ trả Markdown khi Accept: text/markdown", async () => {
  const res = call("/", "text/markdown")
  assert.equal(res.status, 200)
  assert.match(res.headers.get("content-type")!, /^text\/markdown/)
  assert.match(res.headers.get("vary")!, /Accept/)
  const body = await res.text()
  assert.match(body, /^# Vị Việt\n\n> /)
  assert.ok(body.includes("/dishes/pho-bo"))
})

test("trình duyệt (Accept: text/html) không bị chặn, Next trả HTML", () => {
  assert.equal(markdownResponse("/", "text/html,application/xhtml+xml,*/*;q=0.8"), null)
})

test("trang món ăn trả Markdown đủ nội dung", async () => {
  const d = DISHES[0]
  const res = call(`/dishes/${d.id}`, "text/markdown")
  assert.equal(res.status, 200)
  const body = await res.text()
  assert.ok(body.includes(d.en.origin) && body.includes(d.vi.culture))
})

test("đường dẫn không tồn tại trả 404 Markdown có link llms.txt", async () => {
  for (const path of ["/__nope", "/dishes/khong-co-mon-nay"]) {
    const res = call(path, "text/markdown")
    assert.equal(res.status, 404)
    assert.match(res.headers.get("content-type")!, /^text\/markdown/)
    const body = await res.text()
    assert.ok(body.length >= 20 && body.includes("/llms.txt"))
  }
})

test("llms.txt liệt kê mọi món", () => {
  const md = indexMarkdown()
  for (const d of DISHES) assert.ok(md.includes(`/dishes/${d.id})`), d.id)
  assert.equal(pageMarkdown("/glossary")?.startsWith("# Vị Việt glossary"), true)
})

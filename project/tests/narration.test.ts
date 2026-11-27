// Chạy: node --test tests/narration.test.ts (Node 22.6+)
import { test } from "node:test"
import assert from "node:assert/strict"
import { DICT_VI } from "../lib/i18n.ts"
import { DISHES } from "../lib/dishes.ts"
import { audioKey, narrationSegments, splitText } from "../lib/narration.ts"

test("audioKey: ổn định, 14 ký tự hex, câu khác ra mã khác", () => {
  const k = audioKey("Phở bò")
  assert.match(k, /^[0-9a-f]{14}$/)
  assert.equal(audioKey("  Phở bò "), k) // bỏ khoảng trắng hai đầu
  assert.equal(audioKey("Phở bò"), k) // tiếng Việt tổ hợp (NFD) cùng mã với dựng sẵn (NFC)
  assert.notEqual(audioKey("Phở gà"), k)
  // không trùng mã giữa mọi câu của mọi món (bản đầy đủ, tiếng Việt)
  const all = new Set(DISHES.flatMap((d) => narrationSegments(d.vi, DICT_VI, "full")))
  assert.equal(new Set([...all].map(audioKey)).size, all.size)
})

test("narrationSegments: bản ngắn mở đầu bằng tên món, câu không quá 150 ký tự", () => {
  const d = DISHES[0]
  const short = narrationSegments(d.vi, DICT_VI, "short")
  const full = narrationSegments(d.vi, DICT_VI, "full")
  assert.equal(short[0], d.vi.name)
  assert.ok(full.length > short.length)
  assert.ok(full.includes(`${DICT_VI.sectionOrigin}.`))
  for (const s of full) assert.ok(s.length <= 150, s)
})

test("splitText tách câu dài theo dấu phẩy", () => {
  const long = "Một, " + "rất dài ".repeat(30) + "."
  for (const s of splitText(long)) assert.ok(s.length <= 150)
})

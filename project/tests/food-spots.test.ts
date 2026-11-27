// Chạy: node --test tests/agent.test.ts tests/food-spots.test.ts (Node 22.6+)
import { test } from "node:test"
import assert from "node:assert/strict"
import { DISHES, FOOD_SPOTS, distanceKm } from "../lib/dishes.ts"

test("mỗi điểm ẩm thực có id riêng, tọa độ trong Việt Nam và món có thật", () => {
  const ids = new Set(DISHES.map((d) => d.id))
  assert.equal(new Set(FOOD_SPOTS.map((s) => s.id)).size, FOOD_SPOTS.length)
  for (const s of FOOD_SPOTS) {
    const [lat, lng] = s.at
    assert.ok(lat > 8 && lat < 23.5 && lng > 102 && lng < 110, s.id)
    assert.ok(s.dishes.length > 0, s.id)
    for (const d of s.dishes) assert.ok(ids.has(d), `${s.id}: ${d}`)
  }
})

test("distanceKm: Hà Nội - TP. HCM khoảng 1140 km", () => {
  const km = distanceKm([21.0285, 105.8542], [10.7769, 106.7009])
  assert.ok(km > 1100 && km < 1180, String(km))
})

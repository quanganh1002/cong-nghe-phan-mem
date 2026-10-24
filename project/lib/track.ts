/** Gửi sự kiện thống kê cho admin; lỗi mạng thì bỏ qua, không ảnh hưởng người dùng. */
const post = (url: string, body: unknown) => {
  fetch(url, { method: "POST", body: JSON.stringify(body), keepalive: true }).catch(() => {})
}

/** Khách bắt đầu nghe thuyết minh một món (short = bản tóm tắt) */
export const trackPlay = (dish: string, lang: string, short: boolean) => post("/api/play", { dish, lang, short })

/** Khách nghe đến hết câu cuối */
export const trackComplete = (dish: string, lang: string) => post("/api/play", { dish, lang, done: true })

/** Dùng một tính năng phụ: "near_me", "near_listen", "glossary:<id>:term" hoặc "glossary:<id>:meaning" */
export const trackFeature = (key: string) => post("/api/feature", { key })

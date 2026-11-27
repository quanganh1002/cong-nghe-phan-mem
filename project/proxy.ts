import { NextResponse, type NextRequest } from "next/server"
import { markdownResponse, wantsMarkdown } from "@/lib/agent-markdown"
import { listDishes } from "@/lib/dishes-db"

/** Content negotiation: agent gửi `Accept: text/markdown` nhận Markdown (404 cũng bằng Markdown), trình duyệt vẫn nhận HTML. */
export async function proxy(req: NextRequest) {
  const accept = req.headers.get("accept") ?? ""
  // chỉ đọc database khi khách thật sự xin Markdown
  const md = wantsMarkdown(accept) && markdownResponse(req.nextUrl.pathname, accept, await listDishes())
  if (md) return md
  const res = NextResponse.next()
  res.headers.set("Vary", "Accept")
  return res
}

export const config = {
  // Bỏ qua API, admin, asset của Next và file tĩnh (llms.txt, sitemap.xml, ảnh...)
  matcher: ["/((?!api|admin|_next|.*\\.).*)"],
}

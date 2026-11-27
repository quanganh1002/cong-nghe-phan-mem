"use client"

import { useCallback, useEffect, useState } from "react"

/** Các câu đã có file audio của một ngôn ngữ (mã câu → URL), từ GET /api/audio; lỗi mạng thì coi như chưa có file nào */
export function useAudioFiles(lang: string): [Record<string, string>, () => void] {
  const [files, setFiles] = useState<Record<string, string>>({})
  const reload = useCallback(() => {
    let alive = true
    fetch(`/api/audio?lang=${lang}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { files: Record<string, string> }) => alive && setFiles(d.files))
      .catch(() => alive && setFiles({}))
    return () => {
      alive = false
    }
  }, [lang])
  useEffect(reload, [reload])
  return [files, reload]
}

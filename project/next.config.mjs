/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cho phép truy cập dev từ IP LAN/hotspot (mỗi key chỉ khai báo 1 lần, nếu trùng key thì key sau ghi đè key trước)
  allowedDevOrigins: ["192.168.*.*", "172.16.*.*", "172.20.*.*", "10.*.*.*", "*.ngrok-free.dev"],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig

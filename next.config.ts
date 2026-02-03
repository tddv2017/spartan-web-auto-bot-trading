import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 👇 CHỈ GIỮ LẠI ĐÚNG CÁI NÀY
  typescript: {
    ignoreBuildErrors: true,
  },
  // Tuyệt đối KHÔNG có dòng 'eslint' ở đây
};

export default nextConfig;
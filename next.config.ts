import type { NextConfig } from "next"
import withSerwistInit from "@serwist/next"

const nextConfig: NextConfig = {}

const withSerwist = withSerwistInit({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  reloadOnOnline: true,
  maximumFileSizeToCacheInBytes: 5000000,
})

export default withSerwist(nextConfig)

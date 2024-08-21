/** @type {import('next').NextConfig} */

// const withBundleAnalyzer = require('@next/bundle-analyzer')({
//     enabled: true,
// })

// /** @type {import('next').NextConfig} */
// const nextConfig = {}

// module.exports = withBundleAnalyzer(nextConfig)

const nextConfig = {
    // webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    //     config.module.rules.push(
    //         {
    //             test: /\.md$/,
    //             // This is the asset module.
    //             type: 'asset/source',
    //         }
    //     )
    //     return config
    // },
    // experimental: {
    //     staleTimes: {
    //         dynamic: 0,
    //         static: 180,
    //     },
    // },
}

module.exports = nextConfig
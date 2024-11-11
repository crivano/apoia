/** @type {import('next').NextConfig} */

// const withBundleAnalyzer = require('@next/bundle-analyzer')({
//     enabled: true,
// })

// /** @type {import('next').NextConfig} */
// const nextConfig = {}

// module.exports = withBundleAnalyzer(nextConfig)

const nextConfig = {
    // trailingSlash: true,
    output: "standalone",
    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
        config.module.rules.push({
            test: /\.(txt|md)$/,
            // This is the asset module.
            type: 'asset/source',
        })
        if (isServer) {
            config.externals = [
                ...config.externals,
                {
                    // Possible drivers for knex - we'll ignore them
                    // comment the one YOU WANT to use
                    sqlite3: 'sqlite3',
                    // mysql2: 'mysql2', // << using this one
                    mariasql: 'mariasql',
                    mysql: 'mysql',
                    mssql: 'mssql',
                    oracle: 'oracle',
                    'strong-oracle': 'strong-oracle',
                    oracledb: 'oracledb',
                    pg: 'pg',
                    'pg-query-stream': 'pg-query-stream',
                }
            ]
        }
        return config
    }
    // experimental: {
    //     staleTimes: {
    //         dynamic: 0,
    //         static: 180,
    //     },
    // },
}

module.exports = nextConfig
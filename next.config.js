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
    experimental: {
        turbo: {
            rules: {
                '*.md': {
                    loaders: ['raw-loader'],
                    as: '*.js',
                },
            },
        },
        serverComponentsExternalPackages: ['knex'],
    },
    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
        config.module.rules.push({
            test: /\.(txt|md|html)$/,
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
                    'better-sqlite3': 'better-sqlite3',
                    // mysql2: 'mysql2', // << using this one
                    mariasql: 'mariasql',
                    mysql: 'mysql',
                    mssql: 'mssql',
                    oracle: 'oracle',
                    'strong-oracle': 'strong-oracle',
                    oracledb: 'oracledb',
                    pg: 'pg',
                    'pg-query-stream': 'pg-query-stream',
                    "pdfjs-dist/build/pdf.worker.min.js": "pdfjs-dist/build/pdf.worker.min.js"
                }
            ]
        }
        // if (!isServer) {
        //     config.plugins.push(
        //         new webpack.ContextReplacementPlugin(
        //             /knex\/lib\/migrations\/util/,
        //             (context) => {
        //                 // Remove the critical dependency warning
        //                 delete context.dependencies[0].critical;
        //             }
        //         )
        //     );
        // }
        return config
    },
    // experimental: {
    //     staleTimes: {
    //         dynamic: 0,
    //         static: 180,
    //     },
    // },
}

module.exports = nextConfig
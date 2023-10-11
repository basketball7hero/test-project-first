module.exports = {
    NODE_ENV: process.env.NODE_ENV ?? 'development',
    BUILD_VERSION: process.env.BUILD_VERSION ?? 'dev',
    BUILD_TIMESTAMP: new Date().toISOString(),
}
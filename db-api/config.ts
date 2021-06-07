export const MONGO_URI = envOrError("MONGO_URI")
export const MONGO_DB = envOrError("MONGO_DB")

function envOrError(envVar: string) {
    const env = process.env[envVar];
    if (!env) {
        throw new Error(`${envVar} not defined`)
    }
    return env
}
import log4js from 'log4js'
import { database } from './common/Database'
import { client } from './discord/Client'
import { server } from './elysia/Server'

async function main(args: string[]) {
    log4js.configure({
        appenders: {
            console: { type: 'console' },
        },
        categories: {
            default: { appenders: ['console'], level: args[0] === 'debug' ? 'debug' : 'info' },
        },
    })

    await database.connect(process.env.DATABASE!)
    await client.login(process.env.DISCORD_TOKEN)

    server.listen(3000)
}

main(process.argv.slice(2))
import { Elysia, t } from 'elysia'
import log4js from 'log4js'
import { Quote } from '../../common/Quote'
import { getUserById } from '../../discord/Client'
import { databaseDecorator, discordClientDecorator } from '../Setup'

const quotePlugin = new Elysia({ name: 'Quote' })
    .use(databaseDecorator)
    .use(discordClientDecorator)
    .decorate('logger', log4js.getLogger('QuotePlugin'))
    .group('/quote', (app) =>
        app
            .get('/', ({ database }) => database.all<Quote>('quote'))
            .get('/:creatorId', async ({ database, discordClient, params: { creatorId } }) => {
                const quotes = await database.get<Quote>('quote', { creator: creatorId })
                return Promise.all(quotes.map(async quote => {
                    return {
                        content: quote.content,
                        timestamp: quote.timestamp,
                        creator: await getUserById(discordClient, creatorId),
                    }
                }))
            }, {
                params: t.Object({
                    creatorId: t.String(),
                }),
            }),
    )

export { quotePlugin }

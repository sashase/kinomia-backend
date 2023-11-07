import { Config } from './interfaces'

export default (): Config => ({
  port: parseInt(process.env.PORT) || 3000,
  dataSources: {
    multiplexUrl: 'https://multiplex.ua',
    oskarUrl: 'https://oskar.kyiv.ua'
  },
  tmdbApi: {
    url: 'https://api.themoviedb.org/3',
    key: process.env.TMDB_API_KEY
  },
  redis: {
    url: process.env.REDIS_URL,
    ttl: parseInt(process.env.REDIS_TTL)
  }
})
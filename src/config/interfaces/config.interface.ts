export interface Config {
  port: number
  dataSources: {
    multiplexUrl: string
    oskarUrl: string
  }
  tmdbApi: {
    url: string
    key: string
  }
}
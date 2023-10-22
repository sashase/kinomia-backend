export interface Config {
  port: number
  dataSources: {
    multiplexUrl: string
    oskarUrl: string
  }
}
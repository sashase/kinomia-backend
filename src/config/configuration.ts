import { Config } from "./interfaces"

export default (): Config => ({
  port: parseInt(process.env.PORT) || 3000,
  dataSources: {
    multiplexUrl: "https//multiplex.ua",
    oskarUrl: "https://oskar.kyiv.ua"
  }
})
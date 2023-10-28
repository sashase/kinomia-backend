import { Network } from "@prisma/client"

export const networkStub = (): Network => {
  return {
    id: 3,
    name: 'multiplex'
  }
}
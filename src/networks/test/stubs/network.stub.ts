import { Network } from '@prisma/client'

export const networkStub = (networkName): Network => {
  return {
    id: 1,
    name: networkName
  }
}
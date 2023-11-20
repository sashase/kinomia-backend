import { City } from '@prisma/client'

export const cityStub = (): City => {
  return {
    id: 1,
    name: 'Київ'
  }
}


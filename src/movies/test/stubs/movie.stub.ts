import { Movie } from '@prisma/client'

export const movieStub = (): Movie => {
  return {
    id: 507089,
    title: 'П\'ять ночей у Фредді'
  }
}


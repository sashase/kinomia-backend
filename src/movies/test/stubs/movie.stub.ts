import { Movie } from '@prisma/client'

export const movieStub = (): Movie => {
  return {
    id: 507089,
    title: 'Five Nights at Freddy\'s',
    title_ua: 'П\'ять ночей у Фредді',
    overview: 'Recently fired and desperate for work, a troubled young man named Mike agrees to take a position as a night security guard at an abandoned theme restaurant: Freddy Fazbear\'s Pizzeria.',
    backdrop_path: '/t5zCBSB5xMDKcDqe91qahCOUYVV.jpg',
    poster_path: '/j9mH1pr3IahtraTWxVEMANmPSGR.jpg',
    rating: 8
  }
}


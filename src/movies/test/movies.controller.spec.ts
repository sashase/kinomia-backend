import { Test, TestingModule } from '@nestjs/testing'
import { Movie } from '@prisma/client'
import { MoviesController } from '../movies.controller'
import { MoviesService } from '../movies.service'
import { movieStub } from './stubs'

describe('MoviesController', () => {
  let controller: MoviesController
  let moviesService: MoviesService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MoviesController],
      providers: [{ provide: MoviesService, useValue: { getMovies: jest.fn() } }],
    }).compile()

    controller = module.get<MoviesController>(MoviesController)
    moviesService = module.get<MoviesService>(MoviesService)

    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('getMovies', () => {
    describe('when getMovies is called', () => {
      let movies: Movie[]

      beforeEach(async () => {
        jest.spyOn(moviesService, 'getMovies').mockResolvedValue([movieStub()])

        movies = await controller.getMovies()
      })

      test('then it should call moviesService.getMovies', () => {
        expect(moviesService.getMovies).toBeCalled()
      })

      test('then it should return movies', () => {
        expect(movies).toEqual([movieStub()])
      })
    })
  })
})

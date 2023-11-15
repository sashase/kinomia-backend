import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Movie, Prisma } from '@prisma/client'
import { AxiosResponse } from 'axios'
import { Cache } from 'cache-manager'
import { AxiosService } from '../../axios/axios.service'
import { MoviesService } from '../movies.service'
import { MoviesRepository } from '../movies.repository'
import { movieCachedStub, movieStub } from './stubs'

describe('MoviesService', () => {
  let service: MoviesService
  let moviesRepository: MoviesRepository
  let configService: ConfigService
  let axiosService: AxiosService
  let cacheManager: Cache

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        {
          provide: MoviesRepository,
          useValue: {
            getMovies: jest.fn(),
            getMovie: jest.fn(),
            createMovie: jest.fn()
          }
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'tmdbApi.url') return 'https://api.themoviedb.org/3'
              if (key === 'tmdbApi.key') return 'b212eaf11bas2217e2saedcbb9a0'
            }),
          }
        },
        {
          provide: AxiosService,
          useValue: {
            get: jest.fn()
          }
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<MoviesService>(MoviesService)
    moviesRepository = module.get<MoviesRepository>(MoviesRepository)
    configService = module.get<ConfigService>(ConfigService)
    axiosService = module.get<AxiosService>(AxiosService)
    cacheManager = module.get<Cache>(CACHE_MANAGER)

    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('getMovies', () => {
    describe('when getMovies is called', () => {
      const redisKey: string = 'movies'
      let movies: Movie[]

      beforeEach(async () => {
        jest.spyOn(moviesRepository, 'getMovies').mockResolvedValue([movieStub()])
        jest.spyOn(cacheManager, 'get').mockResolvedValue(`[${movieCachedStub()}]`)
        movies = await service.getMovies()
      })

      test('then it should call cacheManager.get', () => {
        expect(cacheManager.get).toBeCalledWith(redisKey)
      })


      test('then it should return movies', () => {
        expect(moviesRepository.getMovies).not.toBeCalled()
        expect(movies).toEqual([movieStub()])
      })

      //
      test('then it should call moviesRepository.getMovies if no movie is found in redis', () => {
        jest.clearAllMocks()
        jest.spyOn(cacheManager, 'get').mockResolvedValue(undefined)

        expect(moviesRepository.getMovies).toBeCalled()
      })
    })
  })

  describe('getMovieByUkrainianTitle', () => {
    describe('when getMovieByUkrainianTitle is called', () => {
      const redisKey: string = 'movie?title_ua=title'
      let movie: Movie

      beforeEach(async () => {
        jest.spyOn(moviesRepository, 'getMovie').mockResolvedValue(movieStub())
        jest.spyOn(cacheManager, 'get').mockResolvedValue(movieCachedStub())
        movie = await service.getMovieByUkrainianTitle('title')
      })

      test('then it should call cacheManager.get', () => {
        expect(cacheManager.get).toBeCalledWith(redisKey)
      })


      test('then it should return movies', () => {
        expect(moviesRepository.getMovie).not.toBeCalled()
        expect(movie).toEqual(movieStub())
      })

      //
      test('then it should call moviesRepository.getMovie if no movie is found in redis', () => {
        jest.clearAllMocks()
        jest.spyOn(cacheManager, 'get').mockResolvedValue(undefined)

        expect(moviesRepository.getMovies).toBeCalled()
      })
    })
  })

  describe('createMovie', () => {
    describe('when createMovie is called', () => {
      const url: string = `https://api.themoviedb.org/3/search/movie?query=title_ua&api_key=b212eaf11bas2217e2saedcbb9a0`

      let movie: Movie

      beforeEach(async () => {
        jest.spyOn(moviesRepository, 'getMovie').mockResolvedValue(movieStub())
        jest.spyOn(axiosService, 'get').mockResolvedValue({
          data: {
            results: [{
              id: 1,
              title: 'title',
              overview: 'overview',
              backdrop_path: '/backdrop.jpg',
              poster_path: '/poster.jpg',
              vote_average: 8
            }]
          }
        } as AxiosResponse)
        jest.spyOn(cacheManager, 'get').mockResolvedValue(movieCachedStub())

        movie = await service.createMovie('title_ua')
      })

      test('then it should call axiosService.get', () => {
        expect(axiosService.get).toBeCalledWith(url)
      })

      test('then it should return if no movie is found', () => {
        jest.clearAllMocks()
        jest.spyOn(axiosService, 'get').mockResolvedValue({
          data: {
            results: []
          }
        } as AxiosResponse)

        expect(moviesRepository.getMovie).not.toBeCalled()
      })

      test('then it should call moviesRepository.getMovie to make sure that movie does not exist', () => {
        const movieWhereInput: Prisma.MovieWhereInput = { OR: [{ id: 1 }, { title: 'title_ua' }] }

        expect(moviesRepository.getMovie).toBeCalledWith({ where: movieWhereInput })
      })

      test('then it should return movie if found', () => {
        expect(moviesRepository.createMovie).not.toBeCalled()
      })

      //
      test('then it should create movie if movie is not found', () => {
        const dto = {
          id: 1,
          title: 'title',
          title_ua: 'title_ua',
          overview: 'overview',
          backdrop_path: '/backdrop.jpg',
          poster_path: '/poster.jpg',
          rating: 8
        }
        jest.spyOn(moviesRepository, 'getMovie').mockResolvedValue(null)

        expect(moviesRepository.createMovie).toBeCalledWith({ data: dto })
      })
    })
  })
})
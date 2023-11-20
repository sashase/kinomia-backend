import { NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Movie, Prisma } from '@prisma/client'
import { AxiosResponse } from 'axios'
import { Cache } from 'cache-manager'
import { REDIS_KEY_MOVIE, REDIS_KEY_MOVIES } from '../../common/constants'
import { AxiosService } from '../../axios/axios.service'
import { MoviesService } from '../movies.service'
import { MoviesRepository } from '../movies.repository'
import { CreateMovieDto } from '../dtos'
import { TmdbMovieSearchResult } from '../interfaces'
import { movieCachedStub, movieStub, tmdbMovieSearchResultsStub } from './stubs'

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
      const redisKey: string = REDIS_KEY_MOVIES
      let movies: Movie[]

      test('then it should call cacheManager.get and return cached movies', async () => {
        jest.spyOn(cacheManager, 'get').mockResolvedValue(`[${movieCachedStub()}]`)

        movies = await service.getMovies()

        expect(cacheManager.get).toBeCalledWith(redisKey)
        expect(moviesRepository.getMovies).not.toBeCalled()
        expect(movies).toEqual([movieStub()])
      })

      test('then it should cache and return movies from the moviesRepository if no movie is found in cache', async () => {
        jest.spyOn(cacheManager, 'get').mockResolvedValue(undefined)
        jest.spyOn(moviesRepository, 'getMovies').mockResolvedValue([movieStub()])

        const redisValue = JSON.stringify([movieStub()])

        movies = await service.getMovies()

        expect(cacheManager.get).toBeCalledWith(redisKey)
        expect(moviesRepository.getMovies).toBeCalledWith({})
        expect(cacheManager.set).toBeCalledWith(redisKey, redisValue)
        expect(movies).toEqual([movieStub()])
      })

      test('then it should throw a NotFoundException if no movie was returned from the moviesRepository', async () => {
        jest.spyOn(cacheManager, 'get').mockResolvedValue(undefined)
        jest.spyOn(moviesRepository, 'getMovies').mockResolvedValue([])

        await expect(service.getMovies()).rejects.toThrowError(NotFoundException)
      })
    })
  })

  describe('getMovieByUkrainianTitle', () => {
    describe('when getMovieByUkrainianTitle is called', () => {
      const title = 'П\'ять ночей у Фредді'
      const redisKey: string = `${REDIS_KEY_MOVIE}?title_ua=${title}`
      let movie: Movie

      test('then it should call cacheManager.get and return cached movie', async () => {
        jest.spyOn(cacheManager, 'get').mockResolvedValue(movieCachedStub())

        movie = await service.getMovieByUkrainianTitle(title)

        expect(cacheManager.get).toBeCalledWith(redisKey)
        expect(moviesRepository.getMovie).not.toBeCalled()
        expect(movie).toEqual(movieStub())
      })

      test('then it should cache and return movie from the moviesRepository if no movie is found in cache', async () => {
        jest.spyOn(cacheManager, 'get').mockResolvedValue(undefined)
        jest.spyOn(moviesRepository, 'getMovie').mockResolvedValue(movieStub())

        const movieWhereInput: Prisma.MovieWhereInput = {
          title_ua: title
        }
        const redisValue = JSON.stringify(movieStub())
        const weekTtl = 1000 * 60 * 60 * 24 * 7

        movie = await service.getMovieByUkrainianTitle(title)

        expect(cacheManager.get).toBeCalledWith(redisKey)
        expect(moviesRepository.getMovie).toBeCalledWith({ where: movieWhereInput })
        expect(cacheManager.set).toBeCalledWith(redisKey, redisValue, weekTtl)
        expect(movie).toEqual(movieStub())
      })

      test('then it should return null if no movie was returned from the moviesRepository', async () => {
        jest.spyOn(cacheManager, 'get').mockResolvedValue(undefined)
        jest.spyOn(moviesRepository, 'getMovie').mockResolvedValue(null)

        movie = await service.getMovieByUkrainianTitle(title)

        expect(movie).toEqual(null)
      })
    })
  })

  describe('createMovie', () => {
    describe('when createMovie is called', () => {
      const title = 'П\'ять ночей у Фредді'
      const url: string = `https://api.themoviedb.org/3/search/movie?query=${title}&api_key=b212eaf11bas2217e2saedcbb9a0`
      let movieSearchResults: TmdbMovieSearchResult[]

      let movie: Movie

      beforeEach(() => {
        movieSearchResults = tmdbMovieSearchResultsStub()
      })

      test('then it should call tmdbAPI and create a movie record if API returned a valid movie', async () => {
        jest.spyOn(axiosService, 'get').mockResolvedValue({
          data: {
            results: movieSearchResults
          }
        } as AxiosResponse)
        jest.spyOn(moviesRepository, 'getMovie').mockResolvedValue(null)
        jest.spyOn(moviesRepository, 'createMovie').mockResolvedValue(movieStub())

        const newestMovie = movieSearchResults[0]

        const dto: CreateMovieDto = {
          id: newestMovie.id,
          title: newestMovie.title,
          title_ua: title,
          overview: newestMovie.overview,
          backdrop_path: newestMovie.backdrop_path,
          poster_path: newestMovie.poster_path,
          rating: newestMovie.vote_average
        }

        movie = await service.createMovie(title)

        expect(axiosService.get).toBeCalledWith(url)
        expect(moviesRepository.createMovie).toBeCalledWith({ data: dto })
        expect(movie).toEqual(movieStub())
      })

      test('then it should return null if no result is received from the API', async () => {
        jest.spyOn(axiosService, 'get').mockResolvedValue({
          data: {
            results: []
          }
        } as AxiosResponse)

        movie = await service.createMovie(title)

        expect(axiosService.get).toBeCalledWith(url)
        expect(moviesRepository.createMovie).not.toBeCalled()
        expect(movie).toEqual(null)
      })

      describe('then it should return null if movie received from the API is invalid', () => {
        const cases = ['id', 'overview', 'backdrop_path', 'poster_path']
        test.each(cases)(
          'if %p is null', async (property) => {
            delete movieSearchResults[0][property]

            jest.spyOn(axiosService, 'get').mockResolvedValue({
              data: {
                results: movieSearchResults
              }
            } as AxiosResponse)

            movie = await service.createMovie(title)

            expect(axiosService.get).toBeCalledWith(url)
            expect(moviesRepository.createMovie).not.toBeCalled()
            expect(movie).toEqual(null)
          }
        )
      })

      test('then it should return a movie if one exists with the same id', async () => {
        jest.spyOn(axiosService, 'get').mockResolvedValue({
          data: {
            results: movieSearchResults
          }
        } as AxiosResponse)

        jest.spyOn(moviesRepository, 'getMovie').mockResolvedValue(movieStub())

        movie = await service.createMovie(title)

        expect(axiosService.get).toBeCalledWith(url)
        expect(moviesRepository.createMovie).not.toBeCalled()
        expect(movie).toEqual(movieStub())
      })
    })
  })
})
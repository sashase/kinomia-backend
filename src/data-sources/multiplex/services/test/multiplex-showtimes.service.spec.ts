const filterShowtimesMock = jest.fn()
const getOrderLinkMock = jest.fn()
const combineDateWithTimeMock = jest.fn()

import { Test, TestingModule } from '@nestjs/testing'
import { Cinema } from '@prisma/client'
import { HTMLElement } from 'node-html-parser'
import { cinemaStub } from '../../../../cinemas/test/stubs'
import { ShowtimesService } from '../../../../showtimes/showtimes.service'
import { ScraperService } from '../../../../data-sources/scraper.service'
import { showtimesRootStub } from '../../../../data-sources/test/stubs'
import { MoviesService } from '../../../../movies/movies.service'
import { movieStub } from '../../../../movies/test/stubs'
import { MultiplexShowtimesService } from '../multiplex-showtimes.service'
import { filteredShowtimesStub, movieElementStub, timestampStub, urlStub, formattedShowtimeStub } from './stubs'

jest.mock('../../utils', () => ({
  filterShowtimes: filterShowtimesMock,
  getOrderLink: getOrderLinkMock,
  combineDateWithTime: combineDateWithTimeMock
}))

describe('MultiplexShowtimesService', () => {
  let service: MultiplexShowtimesService
  let scraperService: ScraperService
  let showtimesService: ShowtimesService
  let moviesService: MoviesService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MultiplexShowtimesService,
        { provide: ScraperService, useValue: { getRoot: jest.fn() } },
        { provide: ShowtimesService, useValue: { validateAndCreateShowtime: jest.fn() } },
        { provide: MoviesService, useValue: { getMovieByUkrainianTitle: jest.fn(), createMovie: jest.fn() } },
      ],
    }).compile()

    service = module.get<MultiplexShowtimesService>(MultiplexShowtimesService)
    scraperService = module.get<ScraperService>(ScraperService)
    showtimesService = module.get<ShowtimesService>(ShowtimesService)
    moviesService = module.get<MoviesService>(MoviesService)

  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('updateShowtimes', () => {
    const url: string = urlStub()
    const cinema: Cinema = cinemaStub()

    it('should call all necessary methods to update showtimes', async () => {
      service.processMovie = jest.fn()
      jest.spyOn(scraperService, 'getRoot').mockResolvedValue(showtimesRootStub('multiplex'))

      const numberOfMovies: number = showtimesRootStub('multiplex').querySelectorAll('.mp_poster').length

      await service.updateShowtimes(url, cinema.id, cinema.internal_cinema_id)

      expect(scraperService.getRoot).toBeCalledWith(url, service['networkName'], cinema.internal_cinema_id)
      expect(service.processMovie).toBeCalledTimes(numberOfMovies)
    })
  })

  describe('processMovie', () => {
    const cinema: Cinema = cinemaStub()
    const movie: HTMLElement = movieElementStub()
    const filteredShowtimes: HTMLElement[] = filteredShowtimesStub()
    const numberOfDays: number = movie.querySelectorAll('.mpp_schedule').length

    it('should call filterShowtimes for each day of a movie schedule', async () => {
      filterShowtimesMock.mockReturnValue(filteredShowtimes)

      await service.processMovie(movie, cinema.id)

      expect(filterShowtimesMock).toBeCalledTimes(numberOfDays)
    })

    it('should call formatAndCreateShowtime for each filtered showtime', async () => {
      jest.spyOn(service, 'formatAndCreateShowtime').mockResolvedValue()

      const numberOfShowtimesPerDay: number = filteredShowtimes.length

      await service.processMovie(movie, cinema.id)

      expect(service.formatAndCreateShowtime).toBeCalledTimes(numberOfShowtimesPerDay * numberOfDays)
    })
  })

  describe('formatAndCreateShowtime', () => {
    const cinemaId: number = cinemaStub().id

    combineDateWithTimeMock.mockReturnValue(new Date(2023, 11, 30, 12, 0, 0))
    getOrderLinkMock.mockReturnValue('https://new.multiplex.ua/order/cinema/0000000017/session/224146')

    it('should call getMovieByUkrainianTitle', async () => {
      jest.spyOn(moviesService, 'getMovieByUkrainianTitle').mockResolvedValue(movieStub())

      await service.formatAndCreateShowtime(filteredShowtimesStub()[0], timestampStub(), cinemaId)

      expect(moviesService.getMovieByUkrainianTitle).toBeCalled()
    })

    it('should call createMovie if getMovieByUkrainianTitle returned null', async () => {
      jest.spyOn(moviesService, 'getMovieByUkrainianTitle').mockResolvedValue(null)
      jest.spyOn(moviesService, 'createMovie').mockResolvedValue(movieStub())

      await service.formatAndCreateShowtime(filteredShowtimesStub()[0], timestampStub(), cinemaId)

      expect(moviesService.getMovieByUkrainianTitle).toBeCalled()
      expect(moviesService.createMovie).toBeCalled()
    })

    it('should correctly process showtime without format', async () => {
      jest.spyOn(moviesService, 'getMovieByUkrainianTitle').mockResolvedValue(movieStub())
      jest.spyOn(moviesService, 'createMovie').mockResolvedValue(movieStub())

      await service.formatAndCreateShowtime(filteredShowtimesStub()[0], timestampStub(), cinemaId)

      expect(showtimesService.validateAndCreateShowtime).toBeCalledWith(formattedShowtimeStub())
    })

    it('should correctly process LUX format showtime', async () => {
      jest.spyOn(moviesService, 'getMovieByUkrainianTitle').mockResolvedValue(movieStub())
      jest.spyOn(moviesService, 'createMovie').mockResolvedValue(movieStub())

      await service.formatAndCreateShowtime(filteredShowtimesStub('LUX')[0], timestampStub(), cinemaId)

      expect(showtimesService.validateAndCreateShowtime).toBeCalledWith(formattedShowtimeStub('LUX'))
    })
  })
})

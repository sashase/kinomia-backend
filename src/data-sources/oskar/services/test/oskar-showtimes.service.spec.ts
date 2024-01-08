const combineDateWithTimeMock = jest.fn()
const combineFormatElementsMock = jest.fn()

import { Test, TestingModule } from '@nestjs/testing'
import { Cinema } from '@prisma/client'
import { HTMLElement } from 'node-html-parser'
import { cinemaStub } from '../../../../cinemas/test/stubs'
import { ShowtimesService } from '../../../../showtimes/showtimes.service'
import { ScraperService } from '../../../../data-sources/scraper.service'
import { showtimesRootStub } from '../../../../data-sources/test/stubs'
import { MoviesService } from '../../../../movies/movies.service'
import { movieStub } from '../../../../movies/test/stubs'
import { OskarShowtimesService } from '../oskar-showtimes.service'
import { combinedDateWithTimeStub, combinedFormatElementsStub, datesStub, movieElementStub, urlStub } from './stubs'

jest.mock('../../utils', () => ({
  combineDateWithTime: combineDateWithTimeMock,
  combineFormatElements: combineFormatElementsMock
}))

describe('OskarShowtimesService', () => {
  let service: OskarShowtimesService
  let scraperService: ScraperService
  let showtimesService: ShowtimesService
  let moviesService: MoviesService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OskarShowtimesService,
        { provide: ScraperService, useValue: { getRoot: jest.fn() } },
        { provide: ShowtimesService, useValue: { validateAndCreateShowtime: jest.fn() } },
        { provide: MoviesService, useValue: { getMovieByUkrainianTitle: jest.fn(), createMovie: jest.fn() } },
      ],
    }).compile()

    service = module.get<OskarShowtimesService>(OskarShowtimesService)
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
    const date: string = datesStub()[0]

    it('should call all necessary methods to update showtimes', async () => {
      service.processMovie = jest.fn()
      jest.spyOn(scraperService, 'getRoot').mockResolvedValue(showtimesRootStub('oskar'))

      const numberOfMovies: number = showtimesRootStub('oskar').querySelectorAll('div.filter-result__item').length

      await service.updateShowtimes(url, cinema.id, cinema.internal_cinema_id, date)

      expect(scraperService.getRoot).toBeCalledWith(url, service['networkName'], cinema.internal_cinema_id, date)
      expect(service.processMovie).toBeCalledTimes(numberOfMovies)
    })
  })

  describe('processMovie', () => {
    const cinema: Cinema = cinemaStub()
    const movie: HTMLElement = movieElementStub()
    const date = datesStub()[0]
    const combinedDateWithTime = combinedDateWithTimeStub()
    const combinedFormatElements = combinedFormatElementsStub()
    const totalNumberOfShowtimes = movie.querySelector('div.filter-result__time-wrap')
      .querySelectorAll('span.time')
      .length

    combineDateWithTimeMock.mockReturnValue(combinedDateWithTime)
    combineFormatElementsMock.mockReturnValue(combinedFormatElements)

    afterEach(() => {
      jest.clearAllMocks()
    })

    it('should call getMovieByUkrainianTitle', async () => {
      jest.spyOn(moviesService, 'getMovieByUkrainianTitle').mockResolvedValue(movieStub())

      await service.processMovie(movie, cinema.id, date)

      expect(moviesService.getMovieByUkrainianTitle).toBeCalled()
    })

    it('should call createMovie if getMovieByUkrainianTitle returned null', async () => {
      jest.spyOn(moviesService, 'getMovieByUkrainianTitle').mockResolvedValue(null)
      jest.spyOn(moviesService, 'createMovie').mockResolvedValue(movieStub())

      await service.processMovie(movie, cinema.id, date)

      expect(moviesService.getMovieByUkrainianTitle).toBeCalled()
      expect(moviesService.createMovie).toBeCalled()
    })

    it('should call all helpers methods for each showtime & skipping showtimes without time element', async () => {
      jest.spyOn(moviesService, 'getMovieByUkrainianTitle').mockResolvedValue(movieStub())

      await service.processMovie(movie, cinema.id, date)

      expect(combineDateWithTimeMock).toBeCalledTimes(totalNumberOfShowtimes)
      expect(combineFormatElementsMock).toBeCalledTimes(totalNumberOfShowtimes)
    })

    it('should call showtimesService for each showtime to create a showtime', async () => {
      jest.spyOn(moviesService, 'getMovieByUkrainianTitle').mockResolvedValue(movieStub())

      await service.processMovie(movie, cinema.id, date)

      expect(showtimesService.validateAndCreateShowtime).toBeCalledTimes(totalNumberOfShowtimes)
    })
  })
})

import { Test, TestingModule } from '@nestjs/testing'
import { Cinema } from '@prisma/client'
import { HTMLElement } from 'node-html-parser'
import { cinemasStub } from '../../../../cinemas/test/stubs'
import { ShowtimesService } from '../../../../showtimes/showtimes.service'
import { ScraperService } from '../../../../data-sources/scraper.service'
import { showtimesRootStub } from '../../../../data-sources/test/stubs'
import { MultiplexShowtimesService } from '../multiplex-showtimes.service'
import { filteredShowtimesStub, showtimesStub, movieStub, timestampStub, urlStub } from './stubs'


describe('MultiplexShowtimesService', () => {
  let service: MultiplexShowtimesService
  let scraperService: ScraperService
  let showtimesService: ShowtimesService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MultiplexShowtimesService,
        { provide: ScraperService, useValue: { getRoot: jest.fn() } },
        { provide: ShowtimesService, useValue: { validateAndCreateShowtime: jest.fn() } },
      ],
    }).compile()

    service = module.get<MultiplexShowtimesService>(MultiplexShowtimesService)
    scraperService = module.get<ScraperService>(ScraperService)
    showtimesService = module.get<ShowtimesService>(ShowtimesService)

  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('updateShowtimes', () => {
    const url: string = urlStub()
    const cinema: Cinema = cinemasStub()[0]

    it('should call all necessary methods to update showtimes', async () => {
      service.processMovie = jest.fn()
      jest.spyOn(scraperService, 'getRoot').mockResolvedValue(showtimesRootStub())

      const numberOfMovies: number = showtimesRootStub().querySelectorAll('.mp_poster').length

      await service.updateShowtimes(url, cinema.id, cinema.internal_cinema_id)

      expect(scraperService.getRoot).toBeCalledWith(url, service['networkName'], cinema.internal_cinema_id)
      expect(service.processMovie).toBeCalledTimes(numberOfMovies)
    })
  })

  describe('processMovie', () => {
    const cinema: Cinema = cinemasStub()[0]
    const movie: HTMLElement = movieStub()
    const filteredShowtimes: HTMLElement[] = filteredShowtimesStub()

    it('should call filterShowtimes for each day of a movie schedule', async () => {
      jest.spyOn(service, 'filterShowtimes').mockReturnValue(filteredShowtimes)

      const numberOfDays: number = movie.querySelectorAll('.mpp_schedule').length

      await service.processMovie(movie, cinema.id)

      expect(service.filterShowtimes).toBeCalledTimes(numberOfDays)
    })

    it('should call formatAndCreateShowtime for each filtered showtime', async () => {
      jest.spyOn(service, 'formatAndCreateShowtime').mockResolvedValue()

      const totalNumberOfShowtimes: number = filteredShowtimes.length

      await service.processMovie(movie, cinema.id)

      expect(service.formatAndCreateShowtime).toBeCalledTimes(totalNumberOfShowtimes)
    })
  })

  // describe('filterShowtimes', () => {
  //   it('should filter and return valid showtimes', () => {
  //     const filteredShowtimes: HTMLElement[] = service.filterShowtimes(showtimesStub())

  //     expect(filteredShowtimes).toBe(filteredShowtimesStub())
  //   })
  // })

  describe('formatAndCreateShowtime', () => {
    it('should process a showtime and call showtimesService to create showtime', async () => {
      await service.formatAndCreateShowtime(filteredShowtimesStub()[0], timestampStub(), cinemasStub()[0].id)

      expect(showtimesService.validateAndCreateShowtime).toBeCalled()
    })
  })
})

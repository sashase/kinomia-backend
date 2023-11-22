import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Showtime } from '@prisma/client'
import { Cache } from 'cache-manager'
import { REDIS_KEY_SHOWTIMES } from '../common/constants'
import { CinemasRepository } from '../cinemas/cinemas.repository'
import { ShowtimesRepository } from './showtimes.repository'
import { CreateShowtimeDto, GetShowtimesDto } from './dtos'

@Injectable()
export class ShowtimesService {
  constructor(
    private readonly showtimesRepository: ShowtimesRepository,
    private readonly cinemasRepository: CinemasRepository,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) { }

  async validateAndCreateShowtime(showtime: CreateShowtimeDto): Promise<void> {
    const { movie, cinemaId, ...rest } = showtime
    const { id, title } = movie

    const cinemaExists = await this.cinemasRepository.getCinema({ where: { id: cinemaId } })
    if (!cinemaExists) return

    const showtimeExists = await this.showtimesRepository.getShowtime({ where: { internal_showtime_id: showtime.internal_showtime_id, cinema_id: cinemaId } })
    if (showtimeExists) return

    await this.showtimesRepository.createShowtime({
      data: {
        cinema: {
          connect: { id: cinemaId }
        },
        movie: {
          connect: { id_title: { id, title } }
        },
        ...rest
      }
    })
  }

  async getShowtimes(dto: GetShowtimesDto): Promise<Showtime[]> {
    const { id, format, price, cinema_id, movie_id, movie_title } = dto
    const redisKey: string = `${REDIS_KEY_SHOWTIMES}?id=${id}&format=${format}&price=${price}&cinema_id=${cinema_id}&movie_id=${movie_id}&movie_title=${movie_title}`

    const todayMidnight: Date = new Date(new Date().setHours(0, 0, 0, 0))
    const tomorrowMidnightTimestamp: number = new Date().setHours(24, 0, 0, 0)

    const cachedShowtimes: string = await this.cacheManager.get(redisKey)

    if (cachedShowtimes) {
      const parsedShowtimes: Showtime[] = JSON.parse(cachedShowtimes, (key, value) => {
        if (key === 'date' && typeof value === 'string') {
          return new Date(value) // Deserialize date string to Date object
        }
        return value
      })
      return parsedShowtimes
    }

    const showtimes: Showtime[] = await this.showtimesRepository.getShowtimes({
      where: {
        id: id ?? undefined,
        format: format ? { contains: format } : undefined,
        price: price ?? undefined,
        cinema_id: cinema_id ?? undefined,
        movie_id: movie_id ?? undefined,
        movie_title: movie_title ? { contains: movie_title } : undefined,
        date: {
          gte: todayMidnight
        }
      },
      include: {
        cinema: {
          include: { network: true }
        },
      }
    })

    if (!showtimes.length) throw new NotFoundException()

    const redisValue: string = JSON.stringify(showtimes)
    const redisTtl: number = Math.floor((tomorrowMidnightTimestamp - Date.now()) + 1) // Milliseconds till tomorrow midnight

    await this.cacheManager.set(redisKey, redisValue, redisTtl)

    return showtimes
  }
}

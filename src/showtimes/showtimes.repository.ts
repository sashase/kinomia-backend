import { Injectable } from '@nestjs/common'
import { Prisma, Showtime } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class ShowtimesRepository {
  constructor(private readonly prisma: PrismaService) { }

  async getShowtimes(params: {
    skip?: number,
    take?: number,
    cursor?: Prisma.ShowtimeWhereUniqueInput,
    where?: Prisma.ShowtimeWhereInput,
    orderBy?: Prisma.ShowtimeOrderByWithRelationInput
  }): Promise<Showtime[]> {
    const { skip, take, cursor, where, orderBy } = params
    return this.prisma.showtime.findMany({ skip, take, cursor, where, orderBy })
  }

  async getShowtime(params: {
    select?: Prisma.ShowtimeSelect, include?: Prisma.ShowtimeInclude, where: Prisma.ShowtimeWhereUniqueInput
  }): Promise<Showtime> {
    const { select, include, where } = params
    return this.prisma.showtime.findUnique({ select, include, where } as Prisma.ShowtimeFindUniqueArgs)
  }

  async createShowtime(params: { data: Prisma.ShowtimeCreateInput }): Promise<Showtime> {
    const { data } = params
    return this.prisma.showtime.create({ data })
  }

  async updateShowtime(params: { where: Prisma.ShowtimeWhereUniqueInput, data: Prisma.ShowtimeUpdateInput }): Promise<Showtime> {
    const { where, data } = params
    return this.prisma.showtime.update({ where, data })
  }

  async deleteShowtime(params: { where: Prisma.ShowtimeWhereUniqueInput }): Promise<Showtime> {
    const { where } = params
    return this.prisma.showtime.delete({ where })
  }
}
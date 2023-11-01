import { Injectable } from '@nestjs/common'
import { Cinema, Prisma } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class CinemasRepository {
  constructor(private readonly prisma: PrismaService) { }

  async getCinemas(params: {
    skip?: number,
    take?: number,
    cursor?: Prisma.CinemaWhereUniqueInput,
    where?: Prisma.CinemaWhereInput,
    orderBy?: Prisma.CinemaOrderByWithRelationInput
  }): Promise<Cinema[]> {
    const { skip, take, cursor, where, orderBy } = params
    return this.prisma.cinema.findMany({ skip, take, cursor, where, orderBy })
  }

  async getCinema(params: {
    select?: Prisma.CinemaSelect, where: Prisma.CinemaWhereInput
  }): Promise<Cinema> {
    const { select, where } = params
    return this.prisma.cinema.findFirst({ select, where })
  }

  async createCinema(params: { data: Prisma.CinemaCreateInput }): Promise<Cinema> {
    const { data } = params
    return this.prisma.cinema.create({ data })
  }

  async updateCinema(params: { where: Prisma.CinemaWhereUniqueInput, data: Prisma.CinemaUpdateInput }): Promise<Cinema> {
    const { where, data } = params
    return this.prisma.cinema.update({ where, data })
  }

  async deleteCinema(params: { where: Prisma.CinemaWhereUniqueInput }): Promise<Cinema> {
    const { where } = params
    return this.prisma.cinema.delete({ where })
  }
}
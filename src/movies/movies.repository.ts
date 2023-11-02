import { Injectable } from '@nestjs/common'
import { Movie, Prisma } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class MoviesRepository {
  constructor(private readonly prisma: PrismaService) { }

  async getMovies(params: {
    skip?: number,
    take?: number,
    cursor?: Prisma.MovieWhereUniqueInput,
    where?: Prisma.MovieWhereInput,
    orderBy?: Prisma.MovieOrderByWithRelationInput
  }): Promise<Movie[]> {
    const { skip, take, cursor, where, orderBy } = params
    return this.prisma.movie.findMany({ skip, take, cursor, where, orderBy })
  }

  async getMovie(params: {
    select?: Prisma.MovieSelect, where: Prisma.MovieWhereInput
  }): Promise<Movie> {
    const { select, where } = params
    return this.prisma.movie.findFirst({ select, where })
  }

  async createMovie(params: { data: Prisma.MovieCreateInput }): Promise<Movie> {
    const { data } = params
    return this.prisma.movie.create({ data })
  }

  async updateMovie(params: { where: Prisma.MovieWhereUniqueInput, data: Prisma.MovieUpdateInput }): Promise<Movie> {
    const { where, data } = params
    return this.prisma.movie.update({ where, data })
  }

  async deleteMovie(params: { where: Prisma.MovieWhereUniqueInput }): Promise<Movie> {
    const { where } = params
    return this.prisma.movie.delete({ where })
  }
}
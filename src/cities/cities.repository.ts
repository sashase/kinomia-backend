import { Injectable } from '@nestjs/common'
import { City, Prisma } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class CitiesRepository {
  constructor(private readonly prisma: PrismaService) { }

  async getCities(params: {
    skip?: number,
    take?: number,
    cursor?: Prisma.CityWhereUniqueInput,
    where?: Prisma.CityWhereInput,
    orderBy?: Prisma.CityOrderByWithRelationInput
  }): Promise<City[]> {
    const { skip, take, cursor, where, orderBy } = params
    return this.prisma.city.findMany({ skip, take, cursor, where, orderBy })
  }

  async getCity(params: {
    select?: Prisma.CitySelect, where: Prisma.CityWhereInput
  }): Promise<City> {
    const { select, where } = params
    return this.prisma.city.findFirst({ select, where })
  }

  async createCity(params: { data: Prisma.CityUncheckedCreateInput }): Promise<City> {
    const { data } = params
    return this.prisma.city.create({ data })
  }

  async updateCity(params: { where: Prisma.CityWhereUniqueInput, data: Prisma.CityUpdateInput }): Promise<City> {
    const { where, data } = params
    return this.prisma.city.update({ where, data })
  }

  async deleteCity(params: { where: Prisma.CityWhereUniqueInput }): Promise<City> {
    const { where } = params
    return this.prisma.city.delete({ where })
  }
}
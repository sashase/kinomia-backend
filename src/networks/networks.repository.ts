import { Injectable } from '@nestjs/common'
import { Network, Prisma } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class NetworksRepository {
  constructor(private readonly prisma: PrismaService) { }

  async getNetworks(params: {
    skip?: number,
    take?: number,
    cursor?: Prisma.NetworkWhereUniqueInput,
    where?: Prisma.NetworkWhereInput,
    orderBy?: Prisma.NetworkOrderByWithRelationInput
  }): Promise<Network[]> {
    const { skip, take, cursor, where, orderBy } = params
    return this.prisma.network.findMany({ skip, take, cursor, where, orderBy })
  }

  async getNetwork(params: {
    select?: Prisma.NetworkSelect, where: Prisma.NetworkWhereInput
  }): Promise<Network> {
    const { select, where } = params
    return this.prisma.network.findFirst({ select, where })
  }

  async createNetwork(params: { data: Prisma.NetworkUncheckedCreateInput }): Promise<Network> {
    const { data } = params
    return this.prisma.network.create({ data })
  }

  async updateNetwork(params: { where: Prisma.NetworkWhereUniqueInput, data: Prisma.NetworkUpdateInput }): Promise<Network> {
    const { where, data } = params
    return this.prisma.network.update({ where, data })
  }

  async deleteNetwork(params: { where: Prisma.NetworkWhereUniqueInput }): Promise<Network> {
    const { where } = params
    return this.prisma.network.delete({ where })
  }
}
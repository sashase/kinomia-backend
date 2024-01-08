import { Test, TestingModule } from '@nestjs/testing'
import { Network } from '@prisma/client'
import { NetworksController } from '../Networks.controller'
import { NetworksService } from '../Networks.service'
import { networkStub } from './stubs'

describe('NetworksController', () => {
  let controller: NetworksController
  let networksService: NetworksService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NetworksController],
      providers: [{ provide: NetworksService, useValue: { getNetworks: jest.fn() } }],
    }).compile()

    controller = module.get<NetworksController>(NetworksController)
    networksService = module.get<NetworksService>(NetworksService)

    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('getNetworks', () => {
    describe('when getNetworks is called', () => {
      let Networks: Network[]

      beforeEach(async () => {
        jest.spyOn(networksService, 'getNetworks').mockResolvedValue([networkStub('testNetwork')])

        Networks = await controller.getNetworks()
      })

      test('then it should call networksService.getNetworks', () => {
        expect(networksService.getNetworks).toBeCalled()
      })

      test('then it should return Networks', () => {
        expect(Networks).toEqual([networkStub('testNetwork')])
      })
    })
  })
})

import { Controller, Get } from '@nestjs/common'
import { NetworksService } from './networks.service'
import { Network } from './entities'
import { ApiTags, ApiOperation, ApiOkResponse, ApiNotFoundResponse } from '@nestjs/swagger'

@Controller('networks')
export class NetworksController {
  constructor(private readonly networksService: NetworksService) { }

  @ApiTags('Networks')
  @ApiOperation({ summary: 'Get networks' })
  @ApiOkResponse({ description: 'Found networks', type: [Network] })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @Get()
  getNetworks() {
    return this.networksService.getNetworks()
  }
}

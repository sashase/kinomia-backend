import { SourceServiceResponse } from '../../interfaces'

export const sourceServiceResponseStub = (networkName: string): SourceServiceResponse => {
  return {
    message: `${networkName.charAt(0).toUpperCase()
      + networkName.slice(1)} Data Successfully Updated`,
    code: 200
  }
}

import { getWebsiteIndex } from '../utils'

const WebsiteHandler = obs => {
  return obs.switchMap(() => {
    return getWebsiteIndex()
  })
}

export default WebsiteHandler

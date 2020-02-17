import { getWebsiteIndex } from '../utils'

const WebsiteHandler = obs => {
  return obs.map(ctx => {
    const index = getWebsiteIndex()
    ctx.response.set('Content-Type', 'text/html')
    return index
  })
}

export default WebsiteHandler

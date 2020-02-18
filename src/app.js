import Koa from 'koa'
import RxRouter from 'koa-router-rx'
import PingHandler from './handlers/ping'
import NearbyHandler from './handlers/nearby'
import WebsiteHandler from './handlers/website'
import AreaHandler from './handlers/areas'
import env from './env'

const router = new RxRouter()

router.get('/v1/ping', PingHandler)
router.get('/v1/nearby', NearbyHandler)
router.get('/v1/areas', AreaHandler)
router.get('/', WebsiteHandler)

const app = new Koa()

app.use(router.routes())
app.listen(env.appPort, env.appHost)

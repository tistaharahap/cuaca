import Koa from 'koa'
import Static from 'koa-static'
import RxRouter from 'koa-router-rx'
import PingHandler from './handlers/ping'
import NearbyHandler from './handlers/nearby'
import AreaHandler from './handlers/areas'
import env from './env'

const router = new RxRouter()

router.get('/v1/ping', PingHandler)
router.get('/v1/nearby', NearbyHandler)
router.get('/v1/areas', AreaHandler)

const app = new Koa()
const staticDir = `${__dirname}/static`

app.use(router.routes())
app.use(Static(staticDir))
app.listen(env.appPort, env.appHost)

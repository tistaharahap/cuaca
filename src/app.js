import Koa from 'koa'
import RxRouter from 'koa-router-rx'
import PingHandler from './handlers/ping'
import NearbyHandler from './handlers/nearby'
import env from './env'

const router = new RxRouter()

router.get('/v1/ping', PingHandler)
router.get('/v1/nearby', NearbyHandler)

const app = new Koa()

app.use(router.routes())
app.listen(env.appPort, env.appHost)

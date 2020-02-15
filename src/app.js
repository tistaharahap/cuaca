import Koa from 'koa'
import RxRouter from 'koa-router-rx'
import PingHandler from './handlers/ping'
import CuacaHandler from './handlers/cuaca'
import env from './env'

const router = new RxRouter()

router.get('/ping', PingHandler)
router.get('/cuaca', CuacaHandler)

const app = new Koa()

app.use(router.routes())
app.listen(env.appPort, env.appHost)

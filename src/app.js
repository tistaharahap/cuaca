import Koa from 'koa'
import RxRouter from 'koa-router-rx'
import PingHandler from './handlers/ping'
import env from './env'

const router = new RxRouter()

router.get('/ping', PingHandler)

const app = new Koa()

app.use(router.routes())
app.listen(env.appPort, env.appHost)

const cuacaHandler = obs => {
  return obs.map(ctx => {
    const { latitude, longitude } = ctx.request.query

    return `${latitude}, ${longitude}`
  })
}

export default cuacaHandler

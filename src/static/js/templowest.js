/* eslint-disable */
const lowestTemp = () => {
  const el = document.getElementById('lowest-temp')
  const obs = Rx.Observable.fromEvent(el, 'click')
    .do((ev) => {
      ev.preventDefault()
      alert('Coming Soon!')
    })
  obs.subscribe()
}

export { lowestTemp }

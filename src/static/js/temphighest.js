/* eslint-disable */
const highestTemp = () => {
    const el = document.getElementById('highest-temp')
    const obs = Rx.Observable.fromEvent(el, 'click')
      .do((ev) => {
        ev.preventDefault()
        alert('Coming Soon!')
      })
    obs.subscribe()
  }
  
  export { highestTemp }
  
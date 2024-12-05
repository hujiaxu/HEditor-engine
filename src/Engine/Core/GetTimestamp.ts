let getTimestamp: () => number

if (
  typeof performance !== 'undefined' &&
  typeof performance.now === 'function' &&
  isFinite(performance.now())
) {
  getTimestamp = () => performance.now()
} else {
  getTimestamp = () => Date.now()
}

export default getTimestamp

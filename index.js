const {log} = console

function* initTrampolineManager() {
  let aPrime = undefined
  let count = 0
  const trackChain = () => {
    count++
    return () => {
      count--
      if (count <= 0) {
        count = 0
        aPrime = undefined
      }
    }
  }
  do {
    let fluents = yield aPrime
    switch (true) {
      case Object.is(Boolean(aPrime), false): {
        if (typeof fluents.prime === "function") {
          aPrime = fluents.prime()
        }
      }
      case aPrime instanceof Promise: {
        if (typeof fluents.chain === "function") {
          aPrime
            .then(fluents.chain)
            .then(trackChain())
        }
      }
    }
  } while (true)
}

const trampolinePromiseOffPrime = {
  _manager: undefined,
  get manager() {
    if (this._manager) {
      return this._manager
    } else {
      this._manager = initTrampolineManager()
      this._manager.next()
      return this._manager
    }
  },
  prime: function (init) {
    const chain = (chainAble) => {
      return {
        collect: this.manager.next({ prime: init, chain: chainAble }).value,
        chain
      }
    }
    return {
      chain
    }
  }
}

function getTimeoutPromise(label, timeout = 1000) {
  return () => new Promise(resolve => {
    setTimeout(() => {
      resolve(`promise:${label}, timeout:${timeout}`);
    }, timeout);
  })
}
function labelTag(strings, exp) {
  return `${strings[0]}${exp}`
}
function getMockChainer(label) {
  return promiseReponse => {
    log(labelTag`test${label}`,
        labelTag`promiseReponse: ${promiseReponse}`
        )
  }
}

trampolinePromiseOffPrime
  .prime(getTimeoutPromise("1", 1))
  .chain(getMockChainer("1a"))
  .chain(getMockChainer("1b"))
  .chain(getMockChainer("1c"))
  .chain(getMockChainer("1d"))
  .collect

trampolinePromiseOffPrime
  .prime(getTimeoutPromise("2", 1000))
  .chain(getMockChainer("2a"))
  .collect

trampolinePromiseOffPrime
  .prime(getTimeoutPromise("3", 1000))
  .chain(getMockChainer("3a"))
  .chain(getMockChainer("3b"))
  .chain(getMockChainer("3c"))
  .collect

trampolinePromiseOffPrime
  .prime(getTimeoutPromise("4", 1000))
  .chain(getMockChainer("4a"))
  .collect

setTimeout(() => {
  trampolinePromiseOffPrime
    .prime(getTimeoutPromise("5", 10))
    .chain(getMockChainer("5a"))
    .collect
  trampolinePromiseOffPrime
    .prime(getTimeoutPromise("6", 20))
    .chain(getMockChainer("6a"))
    .chain(getMockChainer("6b"))
    .collect
  trampolinePromiseOffPrime
    .prime(getTimeoutPromise("7", 1))
    .chain(getMockChainer("7a"))
    .collect
}, 100)
setTimeout(() => {
  trampolinePromiseOffPrime
    .prime(getTimeoutPromise("8", 5000))
    .chain(getMockChainer("8a"))
    .collect
  trampolinePromiseOffPrime
    .prime(getTimeoutPromise("9", 5000))
    .chain(getMockChainer("9a"))
    .collect
  trampolinePromiseOffPrime
    .prime(getTimeoutPromise("10", 5000))
    .chain(getMockChainer("10a"))
    .collect
}, 3000)

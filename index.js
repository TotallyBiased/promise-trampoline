const { log } = console

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
    if (
      Object.is(Boolean(aPrime), false) &&
      typeof fluents.prime === "function"
    ) {
      aPrime = fluents.prime()
    }
    if (aPrime instanceof Promise && typeof fluents.chain === "function") {
      aPrime.then(fluents.chain).then(trackChain())
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
  prime: function(init) {
    const chain = chainAble => {
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
  return () =>
    new Promise(resolve => {
      setTimeout(() => {
        resolve(`"${label}" - "${timeout}"`)
      }, timeout)
    })
}

const Colors = {
  green: 32,
  orange: 33,
  blue: 34,
  red: 31
}

const Logger = {
  _build: label => numCode => `\x1b[${numCode}m${label}\x1b[0m`,
  messageText: function(text) {
    const func = this._build(text)
    return {
      value: func(Colors._blue),
      withColor: {
        get orange() {
            return func(Colors.orange)
        },
        get red() {
            return func(Colors.red)
        },
        get blue() {
            return func(Colors.blue)
        },
        get green() {
            return func(Colors.green)
        }
      }
    }
  }
}

function getMockChainer(label) {
  return promiseReponse => {
	  log(Logger.messageText("Log").withColor.orange)
	  log("\x1b[34m%s\x1b[0m", `\tChain:`, `\x1b[32m${label}\x1b[0m`)
	  log("\x1b[34m%s\x1b[0m", `\tPrime Resolve:`,  `\x1b[32m${promiseReponse}\x1b[0m`)
	  log(`\x1b[31m${"Done"}\x1b[0m\n`)
  }
}

log("Start")

log("Case 1")
trampolinePromiseOffPrime
  .prime(getTimeoutPromise("Promise1", 1))
  .chain(getMockChainer("test1"))
  .chain(getMockChainer("test1"))
  .chain(getMockChainer("test1"))
  .chain(getMockChainer("test1")).collect

log("Case 2")
trampolinePromiseOffPrime
  .prime(getTimeoutPromise("promise2", 1000))
  .chain(getMockChainer("test2")).collect

log("Case 3")
trampolinePromiseOffPrime
  .prime(getTimeoutPromise("Promise3", 1000))
  .chain(getMockChainer("test3"))
  .chain(getMockChainer("test3"))
  .chain(getMockChainer("test3"))

log("Case 4")
trampolinePromiseOffPrime
  .prime(getTimeoutPromise("Promise4", 1000))
  .chain(getMockChainer("test4")).collect

log("SetTimeout: 1\n")
setTimeout(() => {
  trampolinePromiseOffPrime
    .prime(getTimeoutPromise("Promise5", 500))
    .chain(getMockChainer("test5")).collect
  trampolinePromiseOffPrime
    .prime(getTimeoutPromise("Promise6", 1))
    .chain(getMockChainer("test6"))
    .chain(getMockChainer("test6"))
  trampolinePromiseOffPrime
    .prime(getTimeoutPromise("Promise7", 10000))
    .chain(getMockChainer("test7")).collect

  log("SetTimeout: 2\n")
  setTimeout(() => {
    trampolinePromiseOffPrime
      .prime(getTimeoutPromise("Promise8", 5000))
      .chain(getMockChainer("test8")).collect
    trampolinePromiseOffPrime
      .prime(getTimeoutPromise("Promise9", 5000))
      .chain(getMockChainer("test9")).collect
    trampolinePromiseOffPrime
      .prime(getTimeoutPromise("Promise10", 5000))
      .chain(getMockChainer("test10")).collect
  }, 20000)
}, 5000)

log("End")
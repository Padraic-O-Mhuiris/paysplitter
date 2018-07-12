
import Splitter from './../build/contracts/Splitter.json'

const drizzleOptions = {
  web3: {
    block: false,
    fallback: {
      type: 'ws',
      url: 'ws://127.0.0.1:8545'
    }
  },
  contracts: [
    Splitter
  ],
  events: {
    Splitter: ['SplitLog']
  },
  polls: {
    accounts: 1500
  }
}

export default drizzleOptions
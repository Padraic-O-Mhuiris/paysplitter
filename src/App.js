import React, { Component } from 'react'
import getWeb3 from './utils/getWeb3'
import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

// const Splitter = require("../build/contracts/Splitter.json")

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      web3: null,
      split: null,
      address: "",
      accounts: [],
      currentAccount: "",
      balance: "",
      network: ""
    }
    this.handleAddress= this.handleAddress.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillMount() {
    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      })
      this.getCurrent()
    })
    .catch(() => {
      console.log('Error finding web3.')
    })
  }

  handleAddress(event) {
    this.setState({
        address: event.target.value
    })  
  }

  handleSubmit() {
    if(this.state.web3.utils.isAddress(this.state.address)) {
      var acc = this.state.accounts
      acc.push(this.state.address)

      this.setState({
        accounts: acc,
        address: "",
      })
    }
  }

  fetchAccounts() {
    if (this.props.web3 !== null) {
      this.state.web3.eth.getAccounts((err, accounts) => {
        if (err) {
          console.log(err)
        } 
        else {
          if (accounts.length === 0) {
            this.setState({
              currentAccount: "locked",
              balance: "locked"
            })
          } 
          else {
            if (accounts[0] !== this.state.account) {
              this.state.web3.eth.getAccounts((err, accounts) => {
                this.state.web3.eth.getBalance(accounts[0], (err, balance) => {
                  this.setState({
                    currentAccount: accounts[0],
                    balance: balance
                  })
                }); 
              })
            }
          }
        }
      });
    }
  }

  getCurrent() {
    let self = this;
    this.fetchAccounts()
    self.AccountInterval = setInterval(() => self.fetchAccounts(), 1000);
  }

  render() {
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
            <a href="#" className="pure-menu-heading pure-menu-link">SplitEth</a>
        </nav>

        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-3">
            <br/>
            Current Account: {this.state.currentAccount}
            <br/>
            Balance: {this.state.balance}
            <br/>
            Network:

            </div>
            <div className="pure-u-1-3">
            <br/>
            <form className="pure-form">
              <fieldset>
                <input className="pure-input-2-3" type="text" value={this.state.address} onChange={this.handleAddress} placeholder="0x1234"/>
                <a type="submit" className="pure-button pure-button-primary" onClick={this.handleSubmit}>Add Payee</a>
              </fieldset>
            </form>

            </div>
            <div className="pure-u-1-3"></div>
          </div>

          

        </main>
      </div>
    );
  }
}

export default App

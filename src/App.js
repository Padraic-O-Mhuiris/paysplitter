import React, { Component } from 'react'
import getWeb3 from './utils/getWeb3'
import './css/oswald.css'
import './css/open-sans.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'

import {
  Navbar,
  Container,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem } from 'reactstrap';

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
      this.state.web3.eth.getBalance(this.state.address, (err, _balance) => {
        if(err) {
          console.log(err)
        }
        else {
          var obj = {
            address: this.state.address,
            balance: _balance
          }
    
          acc.push(obj)
    
          this.setState({
            accounts: acc,
            address: "",
          })
        }
      })

      
    }
  }

  fetchAccounts() {
    if (this.state.web3 !== null) {
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
              this.setState({
                currentAccount: accounts[0],
              })
            }
          }
        }
      });
    }
  }

  fetchBalance() {
    if(this.state.currentAccount !== "") {
      this.state.web3.eth.getBalance(this.state.currentAccount, (err, _balance) => {
        if(err) {
          console.log(err)
        }
        else {
          if (_balance !== this.state.balance) {
            this.setState({
              balance: _balance,
            })
          }
        }
      })
    }
  }

  getCurrent() {
    let self = this;
    this.fetchAccounts()
    this.fetchBalance()
    self.AccountInterval = setInterval(() => self.fetchAccounts(), 1000);
    self.AccountInterval = setInterval(() => self.fetchBalance(), 1000);
  }

  render() {
    console.log(this.state.accounts)
    return (
      <Container>
        <Navbar color="light" light expand="md">
          <NavbarBrand href="#">SplitEth</NavbarBrand>
        </Navbar>

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

                <br/>

                <input className="pure-input-2-3" type="text" value={this.state.amount} onChange={this.handleAddress} placeholder="1 wei - 1^(10*-18) eth"/>
                <a type="submit" className="pure-button pure-button-primary" onClick={this.handleSubmit}>Split Amount!</a>
              </fieldset>
            </form>

            </div>
            <div className="pure-u-1-3"></div>
          </div>
          <div className="pure-g">
            <div className="pure-u-1-6"></div>
            <div className="pure-u-2-3">


            </div>
            <div className="pure-u-1-6"></div>
          </div>

        </main>
      </Container>
    );
  }
}

export default App

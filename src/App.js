import React, { Component } from 'react'
import Tableux from './tableux'
import getWeb3 from './utils/getWeb3'
import './css/oswald.css'
import './css/open-sans.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'

import {
  Alert,
  Navbar,
  Container,
  Row,
  Col,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Form,
  FormGroup,
  Label, 
  Input, 
  FormText,
  Table,
  Button } from 'reactstrap';

// const Splitter = require("../build/contracts/Splitter.json")

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      web3: null,
      amount: 0,
      address: "",
      name: "",
      accounts: {},
      currentAccount: "",
      balance: "",
      network: ""
    }
    this.handleAddress = this.handleAddress.bind(this)
    this.handleName = this.handleName.bind(this);
    this.handleAmount = this.handleAmount.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleSplit = this.handleSplit.bind(this)
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

  handleName(event) {
    this.setState({
      name: event.target.value
    })
  }

  handleAddress(event) {
    this.setState({
      address: event.target.value
    })  
  }

  handleAmount(event) {
    this.setState({
      amount: event.target.value
    })
  }

  handleSubmit() {
    if(this.state.web3.utils.isAddress(this.state.address)) {
      this.state.web3.eth.getBalance(this.state.address, (err, _balance) => {
        if(err) {
          console.log(err)
        }
        else {
          var key = this.state.address
          var subobj = {
            name: this.state.name,
            address: this.state.address,
            balance: _balance
          }
          var obj = {...this.state.accounts}
          obj[key] = subobj
        
          this.setState({
            accounts: obj,
            address: "",
            name: ""
          })
        }
      })      
    }
  }

  handleSplit() {

  }

  fetchAccounts() {
    if (this.state.web3 !== null || this.state.currentAccount !== "locked") {
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
    if(this.state.currentAccount !== "" && this.state.balance !== "locked") {
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
    self.AccountInterval = setInterval(() => self.fetchAccounts(), 500);
    self.BalanceInterval = setInterval(() => self.fetchBalance(), 500);
  }

  render() {
    return (
      <Container>
        <Row>
          <Col>
          <Navbar color="primary" light expand="md">

            <NavbarBrand href="#">
                SplitEth
            </NavbarBrand>

          </Navbar>
          </Col>
        </Row>
        
        <br/>

        <Row>
          <Col>
            Current Account: {this.state.currentAccount}
          </Col>                  
          <Col>
            Balance: {this.state.balance} 
          </Col>
        </Row>

        <br/>

        <Form inline>
          <FormGroup className="mb-2 mr-sm-5 mb-sm-0">
            <Label htmlFor="i-address" className="mr-sm-5">Address:</Label>            
            <Input type="text" value={this.state.address} onChange={this.handleAddress} id="i-address" placeholder="0x1234" />
          </FormGroup>
          
          <FormGroup className="mb-2 mr-sm-5 mb-sm-0">
            <Label htmlFor="i-address" className="mr-sm-5">Name:</Label>            
            <Input type="text" value={this.state.name} onChange={this.handleName} id="i-name" placeholder="0x1234" />
          </FormGroup>
          <Button color="primary" onClick={this.handleSubmit}>Submit</Button>
        </Form>

        <br/>

        <Tableux 
          data={this.state.accounts} 
          header={[
            {name:"Address", prop:"address"},
            {name:"Name", prop:"name"}, 
            {name:"Balance", prop:"balance"}]} >
        </Tableux>

        <br/>
        
        {Object.keys(this.state.accounts).length ?  
          (<Form inline>
            <FormGroup className="mb-2 mr-sm-5 mb-sm-0">
              <Label htmlFor="i-address" className="mr-sm-5">Total Amount to be split:</Label>            
              <Input type="number" value={this.state.amount} onChange={this.handleAmount} id="i-amount" placeholder="1 wei = 1 * 10^-18 eth"/>
            </FormGroup>
            <Button color="success" onClick={this.handleSplit}>Split!</Button>
          </Form>) : 
          (<div></div>)
        }

      </Container>
    );
  }
}

export default App

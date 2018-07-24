import React, { Component } from 'react'
import Tableux from './tableux'
import getWeb3 from './utils/getWeb3'
import './css/oswald.css'
import './css/open-sans.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import cloneDeep from 'lodash/cloneDeep';
import './App.css'

const Splitter = require("../build/contracts/Splitter.json")

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

const extData = {
  "0xBf54FE90B263788f960deB0479972C4fc33b171e": {
    "name": "example",
    "address": "0xBf54FE90B263788f960deB0479972C4fc33b171e",
    "weight": 1
  },
  "0x71deDfdcE3EcF4b3b19740cF57a79167b05f60ac": {
    "name": "s",
    "address": "0x71deDfdcE3EcF4b3b19740cF57a79167b05f60ac",
    "weight": 1
  },
  "0x3FA993989f890AE8113542Ccf329aAE036c3D975": {
    "name": "s",
    "address": "0x3FA993989f890AE8113542Ccf329aAE036c3D975",
    "weight": 1
  },
}

const readUploadedFileAsText = (inputFile) => {
  const temporaryFileReader = new FileReader();

  return new Promise((resolve, reject) => {
    temporaryFileReader.onerror = () => {
      temporaryFileReader.abort();
      reject(new DOMException("Problem parsing input file."));
    };

    temporaryFileReader.onload = () => {
      resolve(temporaryFileReader.result);
    };
    temporaryFileReader.readAsText(inputFile);
  });
};

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
      network: "",
      refund: 0,
      contract: null,
      formName: "",
      formShare: null,
      fileName: ""
    }

    this.handleAddress = this.handleAddress.bind(this)
    this.handleName = this.handleName.bind(this);
    this.handleAmount = this.handleAmount.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleSplit = this.handleSplit.bind(this)
    this.deletePayee = this.deletePayee.bind(this)
    this.exportToJson = this.exportToJson.bind(this)
    this.handleFileName = this.handleFileName.bind(this)
    this.handleUploadedFileName = this.handleUploadedFileName.bind(this)
  }

  componentWillMount() {
    getWeb3.then(results => {
      this.setState({
        web3: results.web3
      })
      this.getCurrent()
      this.instantiateContract()
      this.importFromJson(extData)
    })
    .catch(() => {
      console.log('Error finding web3.')
    })
  }

  instantiateContract() {
    var contractAddress = Splitter.networks[Object.keys(Splitter.networks)[Object.keys(Splitter.networks).length - 1]].address
    var splitterContract = new this.state.web3.eth.Contract(Splitter.abi, contractAddress);
    this.setState({
      contract: splitterContract
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
    if(!isNaN(event.target.value) || parseInt(event.target.value, 10) >= 0 || event.target.value === "") {
      var _amount = parseInt(event.target.value, 10)
      var accs = {...this.state.accounts}

      var totalWeight = this.getTotalWeight(this.state.accounts)
      
      var spill = _amount % totalWeight
      var transferable_balance = _amount - spill

      Object.keys(this.state.accounts).forEach(function (key) {
        accs[key].payout = (transferable_balance * accs[key].weight / totalWeight) 
        if(isNaN(accs[key].payout)) {
          accs[key].payout = 0
        }
      })

      this.setState({
        amount: _amount,
        accounts: accs,
        refund: spill
      })
    }
  }

  handleFileName(event) {
    this.setState({
      fileName: event.target.value
    })
  }

  async handleUploadedFileName(event) {
    var files = event.target.files
    var fileContents = await readUploadedFileAsText(files[0])
    var obj = JSON.parse(fileContents)
    this.importFromJson(obj)
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
            balance: _balance,
            weight: 1,
            share: "",
            payout: 0,
            remove: <Button color="danger" onClick={this.deletePayee.bind(this, this.state.address)}>Delete</Button>,
            edit: <Button color="primary" onClick={this.editPayee.bind(this, this.state.address)}>Edit</Button>
          }
          var obj = {...this.state.accounts}
          obj[key] = subobj
        
          var tw = this.getTotalWeight(obj)

          for(let address of Object.keys(obj)) {
            obj[address].share = obj[address].weight + " : " + tw
          }
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
    var tw = this.getTotalWeight(this.state.accounts)

    if(Object.keys(this.state.accounts).length === tw) {
      this.state.contract.methods.splitEther(
        Object.keys(this.state.accounts)
      ).send({from: this.state.currentAccount, value:this.state.amount}
      ).on('transactionHash', function(hash){
          console.log("Hash:")
          console.log(hash)
      })
      .on('receipt', function(receipt){
          console.log("Receipt:")
          console.log(receipt)
      })
      .on('confirmation', async function(confirmationNumber, receipt){
        console.log(confirmationNumber, receipt)
      })
    } else {
      var arr = []

      for(let address of Object.keys(this.state.accounts)) {
        arr.push(this.state.accounts[address].weight)
      }

      this.state.contract.methods.splitEtherWeighted(
        Object.keys(this.state.accounts),
        arr
      ).send({from: this.state.currentAccount, value:this.state.amount}
      ).on('transactionHash', function(hash){
          console.log("Hash:")
          console.log(hash)
      })
      .on('receipt', function(receipt){
          console.log("Receipt:")
          console.log(receipt)
      })
      .on('confirmation', async function(confirmationNumber, receipt){
        console.log(confirmationNumber, receipt)
      })
    }
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
              currentAccount: "locked"
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
      })
    } 
  }

  fetchBalance() {
    if(this.state.currentAccount !== "" && this.state.currentAccount !== "locked") {
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

  fetchAllBalances() {
    var aKeys = Object.keys(this.state.accounts)
    var accs = {...this.state.accounts}
    if(aKeys.length > 0) {
      for(let address of aKeys) {
        this.state.web3.eth.getBalance(address, (err, _balance) => {
          if(err) {
            console.log(err)
          }
          else {
            if (_balance !== accs[address].balance) {
              accs[address].balance = _balance
            }
          }
        })
      }
      this.setState({
        accounts: accs
      })
    }
  }

  exportToJson() {
    var keys = Object.keys(this.state.accounts)
    var obj = cloneDeep(this.state.accounts)

    for(let address of keys) {
      var nObj = obj[address]
      delete nObj["balance"]
      delete nObj["share"]
      delete nObj["payout"]
      delete nObj["remove"]
      delete nObj["edit"]
      obj[address] = {...nObj}
    }

    var element = document.createElement('a');
    element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(obj, null, 2)));
    element.setAttribute('download', this.state.fileName + ".json");

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  importFromJson(data) {
    var keys = Object.keys(data)
    var tw = this.getTotalWeight(data)

    for(let address of keys) {
      data[address].share = data[address].weight + " : " + tw
      data[address].payout = 0
      data[address].remove = <Button color="danger" onClick={this.deletePayee.bind(this, address)}>Delete</Button>
      data[address].edit = <Button color="primary" onClick={this.editPayee.bind(this, address)}>Edit</Button>
    }      

    this.setState({
      accounts: data
    })
  }
  
  getTotalWeight(accounts) {
    return Object.keys(accounts).reduce(function (accumulator, currentValue) {
      return accumulator + accounts[currentValue].weight;
    },0)
  }

  deletePayee(address) {
    var accs = {...this.state.accounts}
    delete accs[address]

    var tw = this.getTotalWeight(accs)

    for(let address of Object.keys(accs)) {
      accs[address].share = accs[address].weight + " : " + tw
    }

    this.setState({
      accounts: accs
    })
  }

  editPayee(address) {
    var accs = {...this.state.accounts}

    accs[address].name = <Input type="text" 
      onChange={event => {
        this.setState({
          formName: event.target.value
        })
      }}

      onKeyPress={event => {
      if (event.key === 'Enter') {
        var ac = {...this.state.accounts}
        ac[address].name = this.state.formName
        this.setState({
          accounts: ac
        })
      }
    }}/>

    accs[address].share = <Input type="number" 
      onChange={event => {
        if(parseInt(event.target.value, 10)) { 
          var tw = this.getTotalWeight(this.state.accounts) + parseInt(event.target.value, 10) - accs[address].weight
          for(let _address of Object.keys(accs)) {
            if(address != _address) {
              accs[_address].share = accs[_address].weight + " : " + tw
            }
          }
          this.setState({
            formShare: event.target.value,
            accounts: accs
          })
        }
      }}
      
      onKeyPress={event => {
      if (event.key === 'Enter') {
        var ac = {...this.state.accounts}
        if(Object.keys(ac).length > 1) {
          ac[address].weight = parseInt(this.state.formShare, 10)
        } else {
          ac[address].weight = 1
        }

        var tw = this.getTotalWeight(this.state.accounts)

        for(let address of Object.keys(ac)) {
          ac[address].share = ac[address].weight + " : " + tw
        }

        this.setState({
          accounts: ac
        })
      }
    }}/>
  }

  getCurrent() {
    let self = this;
    this.fetchAccounts()
    self.AccountInterval = setInterval(() => self.fetchAccounts(), 500);
    self.BalanceInterval = setInterval(() => self.fetchBalance(), 500);
    self.AllBalanceInterval = setInterval(() => self.fetchAllBalances(), 2000)
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
            Balance: {this.state.balance} wei
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
            <Input type="text" value={this.state.name} onChange={this.handleName} id="i-name"/>
          </FormGroup>
          <Button color="primary" onClick={this.handleSubmit}>Submit</Button>
        </Form>

        <br/>

        <Tableux 
          data={this.state.accounts} 
          header={[
            {name:"Address", prop:"address"},
            {name:"Name", prop:"name"}, 
            {name:"Balance", prop:"balance"},
            {name:"Share", prop:"share"},
            {name:"Payout", prop:"payout"},
            {name:"Delete", prop:"remove"},
            {name:"Edit", prop:"edit"}]} >
        </Tableux>

        <br/>
        
        {Object.keys(this.state.accounts).length ?  
          (
          <Container>
            <Row>
              <Form inline>
                <FormGroup className="mb-2 mr-sm-5 mb-sm-0">
                  <Label htmlFor="i-address" className="mr-sm-5">Total Amount to be split:</Label>            
                  <Input type="number" value={this.state.amount} onChange={this.handleAmount} id="i-amount" placeholder="1 wei = 1 * 10^-18 eth"/>
                </FormGroup>
                <FormGroup className="mb-2 mr-sm-5 mb-sm-0">
                  <Label htmlFor="i-address" className="mr-sm-5">Amount Returned:</Label>            
                  <Input type="number" value={this.state.refund} readOnly/>
                </FormGroup>
                <Button color="success" onClick={this.handleSplit}>Split!</Button>
              </Form>
            </Row>
            <br/>
            <Row>
              <Col><Input type="text" value={this.state.fileName} onChange={this.handleFileName} id="i-filename" placeholder="file.json" /></Col>
              <Col><Button color="primary" onClick={this.exportToJson}>Export file</Button></Col>
              <Col>
                <Row>
                  <Col></Col>
                  <Col>
                    <input 
                      ref={input => this.inputElement = input}
                      type="file"
                      onChange={this.handleUploadedFileName}
                      style={{display:"none"}}
                    />
                  </Col>
                  <Col><Button onClick={() => this.inputElement.click()} color="secondary">Import file</Button></Col>
                  <Col><Button color="secondary">Import receipt</Button></Col>
                </Row>
              </Col>
            </Row>
          </Container>
          )
          : 
          (<Row>
              <Col></Col>
              <Col></Col>
              <Col>
                <Row>
                  <Col></Col>
                  <Col>
                    <input 
                      ref={input => this.inputElement = input}
                      type="file"
                      onChange={this.handleUploadedFileName}
                      style={{display:"none"}}
                    />
                  </Col>
                  <Col><Button onClick={() => this.inputElement.click()} color="secondary">Import file</Button></Col>
                  <Col><Button color="secondary">Import receipt</Button></Col>
                </Row>
              </Col>
            </Row>)
        }
      </Container>
    );
  }
}

export default App

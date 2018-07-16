import React, { Component } from 'react'


import {
    Table,
    Button } from 'reactstrap';

const row = (x, i, header) => (
  <tr key={`tr-${i}`}>
    {
      header.map((y, k) => (
        <td key={`trc-${k}`}>
          {x[y.prop]}
        </td>
      ))
    }
  </tr>
)

class Tableux extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    if(this.props.data.length != 0) {
      return (
        <Table dark hover borderless>
          <thead>
            <tr>
              {this.props.header.map((x, i) => <th key={`thc-${i}`}>{x.name}</th>)}
            </tr>
          </thead>
          <tbody>
            {Object.keys(this.props.data).map((key, i) => row(this.props.data[key], i, this.props.header))}            
          </tbody>
        </Table>
      );
    } else {
      return (
        <div></div>
      )
    }
  }
}
  
  export default Tableux
  
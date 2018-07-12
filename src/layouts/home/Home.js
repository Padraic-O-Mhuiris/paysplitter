import React, { Component } from 'react'

class Home extends Component {
  render() {
    return (
      <main className="container">
        <div className="pure-g">
          <div className="pure-u-1-1 header">
            <h1>Splitter</h1>
            <p>Split Eth into as many addresses as you want</p>
            <br/><br/>

            <form className="pure-form">
    <fieldset>
        <legend>A compact inline form</legend>

        <input type="email" placeholder="Email"></input>
        <input type="password" placeholder="Password"></input>

        <label htmlFor="remember">
            <input id="remember" type="checkbox"> Remember me</input>
        </label>

        <button type="submit" className="pure-button pure-button-primary">Sign in</button>
    </fieldset>
</form>
          </div>
        </div>
      </main>
    )
  }
}

export default Home

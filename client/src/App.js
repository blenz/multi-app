import React, { Component } from 'react';

import { BrowserRouter as Router, Route} from 'react-router-dom';

import Fib from './Fib';

class App extends Component {
  render() {
    return (
      <Router>
        <div>
          <nav className="navbar navbar-expand-sm bg-dark navbar-dark" style={{float: "none"}}>
              <h1 className="navbar-brand">Calculate Fibonacci Number</h1>
            </nav>
          <div>
            <Route exact path="/" component={Fib} />
          </div>
        </div>
      </Router>
    );
  };
}

export default App;

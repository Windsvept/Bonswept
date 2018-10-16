import React from 'react';
import ReactDOM from 'react-dom';
import Login from './login.jsx';
import Field from './field.jsx';

class Windswept extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      login: true,
      hub: false,
      player: {}
    };
    this.loginSuccess = this.loginSuccess.bind(this);
    this.setUser = this.setUser.bind(this);
  }

  componentDidMount() {
    
  }

  loginSuccess() {
    this.setState({
      login: false,
      hub: true,
    });
  }

  setUser(user) {
    console.log(user);
    this.setState({
      player: user,
    }, () => {
      this.loginSuccess();
    });
  }

  render () {
    return (
      <div>
        <h1>Somni' Vindicta</h1>
        { this.state.login ? 
          <Login setUser={this.setUser} /> : null
        }
        { this.state.hub ?
          <Field player={this.state.player} /> : null
        }
      </div>
    )
  }
}

ReactDOM.render(<Windswept />, document.getElementById('app'));
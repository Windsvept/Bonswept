import React from 'react';
import $ from 'jquery';

export default class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      username: '',
      password: '',
      userexists: true,
    };
    this.login = this.login.bind(this);
    this.createUser = this.createUser.bind(this);
    this.setUser = this.setUser.bind(this);
    this.setPass = this.setPass.bind(this);
    this.loginOrCreate = this.loginOrCreate.bind(this);
  }

  componentDidMount() {
    
  }

  login() {
    let user = {};
    user.username = (this.state.username);
    user.password = (this.state.password);
    $.get('/login', user, (player) => {
      console.log('Login successful!');
      this.props.setUser(player);
    }, 'json')
    .fail(() => {
      console.log('Login failed! \nUsername or Password incorrect.')
    });
  }

  createUser() {
    let user = {};
    user.username = (this.state.username);
    user.password = (this.state.password);
    $.post('/createUser', user, (data) => {
      console.log('Create New User successful!')
    }, 'json');
  }

  loginOrCreate() {
    this.setState({
      userexists: !this.state.userexists
    });
  }

  setUser(e) {
    let user = e.target.value;
    this.setState({
      username: user
    });
  }

  setPass(e) {
    let pass = e.target.value;
    this.setState({
      password: pass
    });
  }

  render () {
    return (
      <div>
        { this.state.userexists ? 
          <div>
            <form >
              <label>Username</label>
              <input type="text" onChange={this.setUser}></input>
              <label>Password</label>
              <input type="password" onChange={this.setPass}></input>          
            </form>
            <button onClick={this.login}>Login</button>
            <button onClick={this.loginOrCreate}>Create New User</button>
          </div> : 
          <div>
            <form >
              <label>New Username</label>
              <input type="text" onChange={this.setUser}></input>
              <label>New password</label>
              <input type="text" onChange={this.setPass}></input>          
            </form>
            <button onClick={this.createUser}>Create New User</button>
            <button onClick={this.loginOrCreate}>Back to Login</button>
          </div>
        }
      </div>
    )
  }

}
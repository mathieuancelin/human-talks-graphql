import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import md5 from 'md5';
import 'whatwg-fetch';

import 'bootstrap/dist/css/bootstrap.css';
import './ui.css';

class Loader extends Component {
  state = {
    bigDot: 0,
  };

  next = () => {
    if (!this.mounted) {
      return;
    }
    if (this.state.bigDot === 2) {
      this.setState({ bigDot: 0 }, () => {
        this.timeout = setTimeout(this.next, 200);
      });
    } else {
      this.setState({ bigDot: this.state.bigDot + 1 }, () => {
        this.timeout = setTimeout(this.next, 200);
      });
    }
  };

  componentDidMount() {
    this.mounted = true;
    this.timeout = setTimeout(this.next, 0);
  }

  componentWillUnmount() {
    this.mounted = false;
    clearTimeout(this.timeout);
  }

  render() {
    return (
      <div style={{ color: this.props.color || 'white' }}>
        <span
          style={{
            fontSize: this.state.bigDot === 0 ? 16 : 12,
            fontWeight: this.state.bigDot === 0 ? 'bold' : 'normal',
          }}>
          {'.'}
        </span>
        <span
          style={{
            fontSize: this.state.bigDot === 1 ? 16 : 12,
            fontWeight: this.state.bigDot === 1 ? 'bold' : 'normal',
          }}>
          {'.'}
        </span>
        <span
          style={{
            fontSize: this.state.bigDot === 2 ? 16 : 12,
            fontWeight: this.state.bigDot === 2 ? 'bold' : 'normal',
          }}>
          {'.'}
        </span>
      </div>
    );
  }
}

class Topbar extends Component {
  render() {
    return (
      <div style={{ height: 60, width: '100vw', backgroundColor: '#333', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white', paddingLeft: 20, paddingRight: 20 }}>
        <span style={{ fontSize: 20 }}>My Emails</span>
        <div style={{ }}> 
          <button type="button" disabled={this.props.loading} onClick={this.props.reloadGraphql} className="btn btn-sm btn-outline-primary"><i className="fa fa-sync-alt"></i> GraphQL</button>
          <button type="button" disabled={this.props.loading} onClick={this.props.reloadRest} style={{ marginLeft: 5 }} className="btn btn-sm btn-outline-primary"><i className="fa fa-sync-alt"></i> REST</button>
        </div>
        <div style={{ display: 'flex' }}> 
          {this.props.me ? this.props.me.name : <Loader />} <i style={{ marginLeft: 5 }} className="fa fa-user" />
        </div>
      </div>
    );
  }
}
const OrgaAvatar = (props) => (
  <img onClick={() => props.setSelectedOrga(props.orga.id)} src={props.orga.smallLogo} style={{ width: 50, height: 50, cursor: 'pointer', marginTop: 5, borderRadius: '50%', border: props.selectedOrga === props.orga.id ? '1px solid #fff' : 'none' }} />
);
class Organizations extends Component {
  render() {
    if (!this.props.organizations) {
      return (
        <div style={{ height: window.innerHeight - 56, width: 60, backgroundColor: '#555', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', color: 'white' }}>
          <Loader />  
        </div>
      )
    }
    return (
      <div style={{ height: window.innerHeight - 56, width: 60, backgroundColor: '#555', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', color: 'white' }}>
        {this.props.organizations.map(o => <OrgaAvatar setSelectedOrga={this.props.setSelectedOrga} selectedOrga={this.props.selectedOrga} orga={o} />)}
      </div>
    )
  }
}
const EmailCell = (props) => (
  <div style={{ 
      onClick: () => props.setSelectedEmail(props.email.id),
      padding: 10, 
      display: 'flex', 
      cursor: 'pointer', 
      flexDirection: 'column', 
      alignItems: 'flex-start', 
      justifyContent: 'center', 
      borderBottom: '1px solid #ddd', 
      backgroundColor: props.selectedEmail === props.email.id ? '#ccc' : 'none',
      color: '#111' 
    }}>
    <span style={{ fontWeight: 'bold', marginBottom: 10 }} onClick={() => props.setSelectedEmail(props.email.id)}>{props.email.title}</span>
    <small onClick={() => props.setSelectedEmail(props.email.id)}>{props.email.recap}..</small>
  </div>
)
class Emails extends Component {
  render() {
    if (!this.props.emails) {
      return (
        <div style={{ height: window.innerHeight - 56, width: 350, backgroundColor: '#eee', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', color: 'white' }}>
          <Loader color="black" />  
        </div>
      )
    }
    return (
      <div style={{ height: window.innerHeight - 56, width: 350, backgroundColor: '#eee', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', color: 'white', overflowY: 'auto' }}>
        {this.props.emails.map(o => <EmailCell setSelectedEmail={this.props.setSelectedEmail} selectedEmail={this.props.selectedEmail} email={o} />)}
      </div>
    )
  }
}
class Email extends Component {
  render() {
    if (!this.props.email) {
      return (
        <div style={{ height: window.innerHeight - 56, padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', width: window.innerWidth - 60 - 350, overflowY: 'auto' }}>
          <Loader color="black" />  
        </div>
      );
    }
    return (
      <div style={{ height: window.innerHeight - 56, padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', width: window.innerWidth - 60 - 350, overflowY: 'auto' }}>
        <h1>{this.props.email.title}</h1>
        <h3>from: {this.props.email.from}</h3>
        <p style={{ textAlign: 'justify' }}>
          {this.props.email.body}
        </p>
      </div>
    )
  }
}

class App extends Component {

  state = {
    type: 'rest',
    loading: false,
    selectedEmail: 'email-0',
    selectedOrga: '1',
    me: null,
    organizations: null,
    emails: null,
    email: null,
  }

  restFetchMe = () => {
    return fetch('/me').then(r => r.json());
  }

  restFetchOrganizations = () => {
    return fetch('/me/organizations').then(r => r.json());
  }

  restFetchOrganization = (id) => {
    return fetch(`/me/organizations/${id}`).then(r => r.json());
  }

  restFetchEmails = (orga) => {
    return fetch(`/me/organizations/${orga}/emails`).then(r => r.json());
  }

  restFetchEmail = (orga, id) => {
    return fetch(`/me/organizations/${orga}/emails/${id}`).then(r => r.json());
  }

  setSelectedOrga = (id) => {
    console.log('setSelectedOrga', id)
    this.setState({ selectedOrga: id }, () => {
      if (this.state.type === 'rest') {
        this.reloadRest();
      } else {
        this.reloadGraphql();
      }
    });
  }

  setSelectedEmail = (id) => {
    console.log('setSelectedEmail', id)
    this.setState({ selectedEmail: id }, () => {
      if (this.state.type === 'rest') {
        this.reloadRest();
      } else {
        this.reloadGraphql();
      }
    });
  }

  reloadRest = () => {
    this.setState({
      type: 'rest',
      loading: true,
      me: null,
      organizations: null,
      emails: null,
      email: null,
    }, () => {
      this.restFetchMe().then(me => {
        this.setState({ me });
        this.restFetchOrganizations().then(organizations => {
          this.setState({ organizations });
          this.restFetchOrganization(this.state.selectedOrga).then(organization => {
            this.setState({ organization });
            this.restFetchEmails(organization.id).then(emails => {
              this.setState({ emails });
              this.restFetchEmail(this.state.selectedOrga, this.state.selectedEmail).then(email => {
                this.setState({ email, loading: false });
              });
            });
          });
        });
      });
    });
  }

  reloadGraphql = () => {
    this.setState({
      type: 'graphql',
      loading: true,
      me: null,
      organizations: null,
      emails: null,
      email: null,
    }, () => {
      
    });
  }

  render() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh' }}>
        <Topbar me={this.state.me} loading={this.state.loading} reloadGraphql={this.reloadGraphql} reloadRest={this.reloadRest} />
        <div style={{ display: 'flex', flexDirection: 'row', width: '100%', height: '100%' }}>
          <Organizations setSelectedOrga={this.setSelectedOrga} selectedOrga={this.state.selectedOrga} organizations={this.state.organizations} />
          <Emails setSelectedEmail={this.setSelectedEmail} selectedEmail={this.state.selectedEmail} emails={this.state.emails} />
          <Email email={this.state.email} setSelectedEmail={this.setSelectedEmail} />
        </div>
      </div>
    );
  }
}

export function init(node) {
  ReactDOM.render(<App />, node);
}
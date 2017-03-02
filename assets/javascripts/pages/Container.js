import React, { Component, PropTypes as T } from 'react'
import Navigation from '../components/Navigation'
import Sidebar from '../components/Sidebar'
import Footer from '../presentations/Footer'
//import { IntlProvider, FormattedMessage, addLocaleData } from 'react-intl'
//import lang from '../components/lang'

import getMuiTheme from 'material-ui/styles/getMuiTheme'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'

export default class Container extends Component {

  static propTypes = {
    route: T.object.isRequired,
    children: T.object
  }

  state = {
    expanded: true,
  }

  handleClick() {
    this.setState({ expanded: !this.state.expanded })
  }

  render() {
    let children = null
    if (this.props.children) {
      children = React.cloneElement(this.props.children, {
        auth: this.props.route.auth, //sends auth instance from route to children
        expanded: this.state.expanded
      })
    }
    return (
      <MuiThemeProvider muiTheme={getMuiTheme()}>
      {/* <IntlProvider locale={lang.locale} messages={lang.messages}> */}
        <div>
          <Navigation expanded={this.state.expanded} collapseToggle={::this.handleClick} auth={this.props.route.auth} />
          <Sidebar expanded={this.state.expanded} auth={this.props.route.auth} />
          <div>
            { children }
          </div>
          <Footer />
        </div>
      {/* </IntlProvider> */}
      </MuiThemeProvider>
    )
  }

}

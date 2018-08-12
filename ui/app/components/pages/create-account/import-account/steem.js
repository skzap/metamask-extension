const Component = require('react').Component
const PropTypes = require('prop-types')
const h = require('react-hyperscript')
const { withRouter } = require('react-router-dom')
const { compose } = require('recompose')
const connect = require('react-redux').connect
const actions = require('../../../../actions')
const FileInput = require('react-simple-file-input').default
const { DEFAULT_ROUTE } = require('../../../../routes')
const HELP_LINK = 'https://support.metamask.io/kb/article/7-importing-accounts'

class SteemImportSubView extends Component {
  constructor (props) {
    super(props)

    this.state = {
      file: null,
      fileContents: '',
    }
  }

  render () {
    const { error } = this.props

    return (
      h('div.new-account-import-form__json', [
        h('input.new-account-import-form__input-password', {
          type: 'username',
          placeholder: this.context.t('enterUsername'),
          id: 'steem-username-box',
          onKeyPress: this.createKeyringOnEnter.bind(this),
        }),

        h('input.new-account-import-form__input-password', {
          type: 'password',
          placeholder: this.context.t('enterPassword'),
          id: 'steem-password-box',
          onKeyPress: this.createKeyringOnEnter.bind(this),
        }),

        h('div.new-account-create-form__buttons', {}, [

          h('button.btn-default.new-account-create-form__button', {
            onClick: () => this.props.history.push(DEFAULT_ROUTE),
          }, [
            this.context.t('cancel'),
          ]),

          h('button.btn-primary.new-account-create-form__button', {
            onClick: () => this.createNewKeychain(),
          }, [
            this.context.t('import'),
          ]),

        ]),

        error ? h('span.error', error) : null,
      ])
    )
  }

  onLoad (event, file) {
    this.setState({file: file, fileContents: event.target.result})
  }

  createKeyringOnEnter (event) {
    if (event.key === 'Enter') {
      event.preventDefault()
      this.createNewKeychain()
    }
  }

  createNewKeychain () {
    const { firstAddress, displayWarning, importNewSteemAccount, setSelectedAddress } = this.props

    const usernameInput = document.getElementById('steem-username-box')
    const username = usernameInput.value

    if (!username) {
      const message = this.context.t('needImportUsername')
      return displayWarning(message)
    }

    const passwordInput = document.getElementById('steem-password-box')
    const password = passwordInput.value

    if (!password) {
      const message = this.context.t('needImportPassword')
      return displayWarning(message)
    }

    importNewSteemAccount([ username, password ])
      .then(({ selectedAddress }) => {
        console.log(selectedAddress)
        if (selectedAddress) {
          history.push(DEFAULT_ROUTE)
          displayWarning(null)
        } else {
          displayWarning('Error importing account.')
          setSelectedAddress(firstAddress)
        }
      })
      .catch(err => err && displayWarning(err.message || err))
  }
}

SteemImportSubView.propTypes = {
  error: PropTypes.string,
  goHome: PropTypes.func,
  displayWarning: PropTypes.func,
  firstAddress: PropTypes.string,
  importNewSteemAccount: PropTypes.func,
  history: PropTypes.object,
  setSelectedAddress: PropTypes.func,
  t: PropTypes.func,
}

const mapStateToProps = state => {
  return {
    error: state.appState.warning,
    firstAddress: Object.keys(state.metamask.accounts)[0],
  }
}

const mapDispatchToProps = dispatch => {
  return {
    goHome: () => dispatch(actions.goHome()),
    displayWarning: warning => dispatch(actions.displayWarning(warning)),
    importNewSteemAccount: options => dispatch(actions.importNewAccount('STEEM', options)),
    setSelectedAddress: (address) => dispatch(actions.setSelectedAddress(address)),
  }
}

SteemImportSubView.contextTypes = {
  t: PropTypes.func,
}

module.exports = compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(SteemImportSubView)

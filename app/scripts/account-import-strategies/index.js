const Wallet = require('ethereumjs-wallet')
const importers = require('ethereumjs-wallet/thirdparty')
const ethUtil = require('ethereumjs-util')
const steem = require('steem')

const accountImporter = {
  importSteemAccount (username, masterPassword) {
    // a steem master password generates 4 other keys that are used depending on the transaction type
    // 1- owner key: can do only 1 tx type: reset all keys
    // 2- active key: can do monetary txs
    // 3- posting key: can do non-monetary txs (votes, comments, follows, etc)
    // 4- memo key: currently unused. Should be used for private messaging in the future

    const keys = steem.auth.getPrivateKeys(username, masterPassword)
    if (keys) return keys
    else throw new Error('Wrong STEEM Master Password')
  },

  importAccount (strategy, args) {
    try {
      const importer = this.strategies[strategy]
      const privateKeyHex = importer.apply(null, args)
      return Promise.resolve(privateKeyHex)
    } catch (e) {
      return Promise.reject(e)
    }
  },

  strategies: {
    'Private Key': (privateKey) => {
      if (!privateKey) {
        throw new Error('Cannot import an empty key.')
      }

      const prefixed = ethUtil.addHexPrefix(privateKey)
      const buffer = ethUtil.toBuffer(prefixed)

      if (!ethUtil.isValidPrivate(buffer)) {
        throw new Error('Cannot import invalid private key.')
      }

      const stripped = ethUtil.stripHexPrefix(prefixed)
      return stripped
    },
    'JSON File': (input, password) => {
      let wallet
      try {
        wallet = importers.fromEtherWallet(input, password)
      } catch (e) {
        console.log('Attempt to import as EtherWallet format failed, trying V3...')
      }

      if (!wallet) {
        wallet = Wallet.fromV3(input, password, true)
      }

      return walletToPrivateKey(wallet)
    }
  },

}

function walletToPrivateKey (wallet) {
  const privateKeyBuffer = wallet.getPrivateKey()
  return ethUtil.bufferToHex(privateKeyBuffer)
}

module.exports = accountImporter

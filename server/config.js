module.exports = {
  key: {
    headerPrefix: 'Bearer ',
    // privateKey: 'dud3nufswjfn',
    // privateKey: '904c3972-c6fa-4084-96f1-395a337872ae',
    privateKey: '-----BEGIN PUBLIC KEY-----\n' +
    'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAm7beaE20IabSio93HK0zZ5cLEXoxexwKX4bnjP8GodiGBD8lgkN10qnEPkGD0aSQMYDMEqsgqNBR2m5jwPh+j7Mdhkx13oZrRrA/+6ODGrI6dG8D7xDdaEHsS34sVinAAFlVkxboitJ1fv18C8oSB1p55DHDH2+9SQSrByPvRshf6AGLXOmAVwM4Twl6o+KaJ5j8UDkpn6NEfZ1C12D0mttKVtJEXW0WP4Bk8qIAGZ4qdmi8K5S0FXmX+0O89oLXzh+l47BNUFrJaexJAieiHsqHihzNQeZOKstt43K8yJJp89uo17p4akARH0GU928MgkXgavOlirxD9log+vdhawIDAQAB\n' +
    '-----END PUBLIC KEY-----',
    tokenExpiry: 60 * 60
  },
  database: {
    url: 'mongodb://localhost:27017/ige'
  }
};

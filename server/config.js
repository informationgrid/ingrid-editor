module.exports = {
  key: {
    headerPrefix: 'Bearer ',
    // publicKey: 'dud3nufswjfn',
    // publicKey: '904c3972-c6fa-4084-96f1-395a337872ae',
    publicKey: '-----BEGIN PUBLIC KEY-----\n' +
    'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAkjR8r5ogFae+cxlVbf/24eWBEVVCpCztPeXUc11oCUcFcSW6Mxkpxr2tnnZ/dfd2Lcr9a+UuEvDiuLwA0dsBx/0tTW52MTWxcmFjMtSu6V1ByMaPiPvoJwJ/T8g+wxqFl6eCsYrRCfkj/zDVaIyGCZBCPv22voiCHomR53ietnWPERCvFiKqcHPmC0GDYoOcYSzJT+TwOb+w1ynZWLj54WUmoYGUtmHd+hHX/MlkK051zcAzeixpvJX3vZuaFNE0f2NTFi0MaR1G4RFKfKj+U5b7Q5+bQmkQpyCgMwQ1isMMoSDCwPEAeezjmp8XLmcpzdhS+aKiIFIqXJ1SNnWZWwIDAQAB\n' +
    '-----END PUBLIC KEY-----',
    tokenExpiry: 60 * 60
  },
  database: {
    url: 'mongodb://localhost:27017/ige'
  }
};

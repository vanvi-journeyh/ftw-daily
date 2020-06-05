import { types as sdkTypes } from './sdkLoader';
import moment from 'moment';
import Decimal from 'decimal.js';

// TODO: read PORT from env var
const API_BASE_URL = 'http://localhost:3500';

const serialize = data => {
  console.log('serialize input:', data);
  const str = JSON.stringify(data, sdkTypes.replacer);
  console.log('serialize output:', str);
  return str;
};

const deserialize = str => {
  console.log('deserialize input:', str);
  const data = JSON.parse(str, (key, val) => {
    if (typeof val === 'string') {
      const date = moment(val, moment.ISO_8601);
      if (date.isValid()) {
        console.log('string->Date', key, val, date.toDate());
        return date.toDate();
      }
      let decimal;
      try {
        decimal = new Decimal(val);
        console.log('string->Decimal:', key, val, decimal);
        return decimal;
      } catch (e) {
        return val;
      }
      return val;
    }
    return sdkTypes.reviver(key, val);
  });
  console.log('deserialize output:', data);
  return data;
};

const post = (path, body) => {
  console.log('post', path, body);
  const url = `${API_BASE_URL}${path}`;
  const options = {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: serialize(body),
  };
  return window
    .fetch(url, options)
    .then(res => {
      if (res.status >= 400) {
        const e = new Error('Local API request failed');
        e.apiResponse = res;
        throw e;
      }
      return res;
    })
    .then(res => res.text())
    .then(deserialize);
};

export const transactionLineItems = body => {
  return post('/api/transaction-line-items', body);
};

export const initiatePrivileged = body => {
  return post('/api/initiate-privileged', body);
};

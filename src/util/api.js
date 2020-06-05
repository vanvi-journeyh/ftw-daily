// TODO: read PORT from env var
const API_BASE_URL = 'http://localhost:3500';

const post = (path, body) => {
  console.log('post', path, body);
  const url = `${API_BASE_URL}${path}`;
  const options = {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  };
  return window.fetch(url, options)
    .then(res => {
      if (res.status >= 400) {
        const e = new Error('Local API request failed');
        e.apiResponse = res;
        throw e;
      }
      return res;
    })
    .then(res => res.json());
};

export const transactionLineItems = body => {
  return post('/api/transaction-line-items', body);
};

export const initiatePrivileged = body => {
  return post('/api/initiate-privileged', body);
};

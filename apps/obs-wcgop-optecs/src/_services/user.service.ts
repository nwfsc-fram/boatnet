// import config from 'config';
import { authHeader } from '../_helpers';

const apiUrl = 'https://localhost:9000';

export const userService = {
  login,
  logout
};

function login(username: string, password: string) {
  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  };

  // console.log('PERFORMING LOGIN', requestOptions);
  // fetch(`${apiUrl}/api/v1/login`, requestOptions)
  return fetch(`/api/v1/login`, requestOptions)
    .then(handleResponse)
    .then((user) => {
      // login successful if there's a jwt token in the response
      if (user.token) {
        // store user details and jwt token in local storage to keep user logged in between page refreshes
        localStorage.setItem('user', JSON.stringify(user));
      }

      return user;
    })
    .catch((err) => {
      console.log('User service error', err);
    });
}

function logout() {
  // remove user from local storage to log user out
  localStorage.removeItem('user');
}

function handleResponse(response: any) {
  console.log('IN HANDLE RESPONSE');
  return response.text().then((text: any) => {
    const data = text && JSON.parse(text);
    if (!response.ok) {
      if (response.status === 401) {
        // auto logout if 401 response returned from api
        logout();
        location.reload(true);
      }

      const error = (data && data.message) || response.statusText;
      return Promise.reject(error);
    }

    return data;
  });
}

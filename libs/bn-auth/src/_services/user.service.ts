// User Auth routines loosely based on sample code in
// http://jasonwatmore.com/post/2018/07/14/vue-vuex-user-registration-and-login-tutorial-example

function login(username: string, password: string) {
  // TODO use axios for this instead?
  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  };

  // const apiUrl = 'https://localhost:9000';
  // fetch(`${apiUrl}/api/v1/login`, requestOptions)  // Expect proxy
  return fetch(`/api/v1/login`, requestOptions)
    .then(handleResponse)
    .then((user) => {
      // login successful if there's a jwt token in the response
      if (user.token) {
        // store user details and jwt token in local storage to keep user logged in between page refreshes
        localStorage.setItem('user', JSON.stringify(user));
      }
      return user;
    });
}

function logout() {
  // remove user from local storage to log user out
  localStorage.removeItem('user');
}

function handleResponse(response: any) {
  return response.text().then((text: any) => {

    const data = text && JSON.parse(text);
    if (!response.ok) {
      if (response.status === 401) {
        // auto logout if 401 response returned from api
        logout();
        // location.reload(true);
      }

      const error = (data && data.message) || response.statusText;
      return Promise.reject(error);
    }

    return data;
  });
}

export const userService = {
  login,
  logout
};

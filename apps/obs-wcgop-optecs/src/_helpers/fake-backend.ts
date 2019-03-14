
// array in local storage for registered users
let users = JSON.parse(localStorage.getItem('users') || '') || [
  {
    id: 1,
    username: 'test',
    password: 'test',
    firstName: 'Test',
    lastName: 'McTest',
    roles: ['observer', 'scientist']
  }
];

export function configureFakeBackend() {
  let realFetch = window.fetch;
  window.fetch = function(url, opts) {
    return new Promise((resolve, reject) => {
      // wrap in timeout to simulate server api call
      setTimeout(() => {
        // authenticate
        const urlStr = url as string;
        if (urlStr.endsWith('/api/v1/login') && opts && opts.method === 'POST') {
          // get parameters from post request
          const params = JSON.parse(opts.body as string);

          // find if any user matches login credentials
          const filteredUsers = users.filter((user: any) => {
            return (
              user.username === params.username &&
              user.password === params.password
            );
          });

          if (filteredUsers.length) {
            // if login details are valid return user details and fake jwt token
            const user = filteredUsers[0];
            const responseJson = {
              id: user.id,
              username: user.username,
              firstName: user.firstName,
              lastName: user.lastName,
              roles: user.roles,
              token: 'fake-jwt-token'
            };
            resolve({
              ok: true,
              text: () => Promise.resolve(JSON.stringify(responseJson))
            } as Response);
          } else {
            // else return error
            reject('Username or password is incorrect');
          }

          return;
        }

        // pass through any requests not handled above
        realFetch(url, opts).then((response) => resolve(response));
      }, 500);
    });
  };
}

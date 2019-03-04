export function authHeader() {
  // return authorization header with jwt token
  const userStored = localStorage.getItem('user');
  let user: any = {};
  if (userStored) {
    user = JSON.parse(userStored);
  }

  if (user && user.token) {
    return { Authorization: 'Bearer ' + user.token };
  } else {
    return {};
  }
}

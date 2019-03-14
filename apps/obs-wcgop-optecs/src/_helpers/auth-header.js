// Auth routines based on sample code in
// http://jasonwatmore.com/post/2018/07/14/vue-vuex-user-registration-and-login-tutorial-example

export function authHeader() {
    // return authorization header with jwt token
    // TODO storing JWT in localStorage is discouraged usually, but is OK because we
    // aren't actually using the JWT for authorization (we are still requiring a pw)
    let user = JSON.parse(localStorage.getItem('user'));

    if (user && user.token) {
        return { 'Authorization': 'Bearer ' + user.token };
    } else {
        return {};
    }
}

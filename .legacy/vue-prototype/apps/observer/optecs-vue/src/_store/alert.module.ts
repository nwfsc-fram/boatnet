const state = {
  type: null,
  message: null
};

const actions = {
  success({ commit }: any, message: string) {
    commit('success', message);
  },
  error({ commit }: any, message: string) {
    commit('error', message);
  },
  clear({ commit }: any, message: string) {
    commit('success', message);
  }
};

const mutations = {
  success(newState: any, message: string) {
    newState.type = 'alert-success';
    newState.message = message;
  },
  error(newState: any, message: string) {
    newState.type = 'alert-danger';
    newState.message = message;
  },
  clear(newState: any) {
    newState.type = null;
    newState.message = null;
  }
};

export const alert = {
  namespaced: true,
  state,
  actions,
  mutations
};

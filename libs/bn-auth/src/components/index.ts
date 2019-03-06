import Vue from "vue";
import BoatnetLogin from "./BoatnetLogin.vue";

const Components: any = {
  BoatnetLogin
};

Object.keys(Components).forEach(name => {
  Vue.component(name, Components[name]);
});

export default Components;

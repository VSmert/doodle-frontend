import Vue from "vue";
import App from "./App.vue";
import { doodleSetup } from "./doodleSetup";

Vue.config.productionTip = false;
Vue.config.devtools = false;

doodleSetup();

new Vue({
    render: (h) => h(App),
}).$mount("#app");

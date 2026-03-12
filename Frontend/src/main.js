import { createApp } from "vue";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "aws-amplify/auth/enable-oauth-listener";
import App from "./App.vue";
import router from "./router";
import { configureAmplifyAuth } from "./auth/amplifyAuth";

configureAmplifyAuth();
createApp(App).use(router).mount("#app");

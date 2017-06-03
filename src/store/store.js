// JS Imports
// –– Vue
import Vue from 'vue'
import Vuex from 'vuex'
// –– Websocket
import ws from '../ws';
// –– Models
import score from './score'


// Configs
// –– Use Vuex
Vue.use(Vuex)


// init store
const store = new Vuex.Store({
    modules: {
        score
    },
    plugins: [ws.vuex]
})

export default store

// Hot reload modules
if (module.hot) {
    // accept actions and mutations as hot modules
    module.hot.accept(['./score'], () => {
        // swap in the new actions and mutations
        store.hotUpdate({
            modules: {
                score: require('./score').default
            }
        })
    })
}

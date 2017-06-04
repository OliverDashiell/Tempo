// JS Imports
// –– Websocket
import ws from '../ws.js'



const ScoreModule = {
    state: {
        user: null,
        value: 0,
        rank: null,
        color: "#E57373",
        highscores: []
    },
    mutations: {
        set_score(state, score) {
            state.user = score.user
            state.value = score.value
            state.rank = score.rank
            state.color = score.color
        },
        set_user(state, user) {
            state.user = user
        },
        set_value(state, value) {
            state.value = value
        },
        set_rank(state, rank) {
            state.rank = rank
        },
        set_color(state, color) {
            state.color = color
        },
        set_highscores(state, scores) {
            state.highscores = scores
        },
    },
    actions: {
        get_highscores({ state, commit }) {
            ws.rpc('getScores').then(scores => {
                commit('set_highscores', scores)
            })
        },
        submit_highscore({ state, commit }, params) {
            ws.rpc('submitScore', params).then(scores => {
                commit('set_highscores', scores)
            })
        },
        update_color({ state, commit }, color) {
            commit('set_color', color)
        },
        update_name({ state, commit }, name) {
            commit('set_user', name)
        },
        update_value({ state, commit }, value) {
            commit('set_value', value)
        }
    }
}

export default ScoreModule

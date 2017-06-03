<template>
    <div class="ScorePanel" :style="{color:color}">
        <div class="header" :class="{max:!name}">
            <div class="name" :style="{background:color, color:color}">
                <input class="input" maxlength="4"
                       :class="{underline:!name}"
                       v-model="name"/>
                <name-spinner class="outer-text" :fill="color"></name-spinner>
            </div>
        </div>
        <div class="content" :class="{min:!name}">
            <ul class="scores">
                <li class="entry" v-for="(entry, index) in scores" :style="ranking_style(entry.name)">
                    <div class="rank">{{index+1}}</div>
                    <div class="user">{{entry.name}}</div>
                    <div class="score">{{entry.score}}</div>
                </li>
            </ul>
            <div class="entry my-score" :style="{borderColor:color}">
                <div class="rank">{{current_rank}}</div>
                <div class="user">{{name}}</div>
                <div class="score">{{score}}</div>
            </div>
        </div>
    </div>
</template>


<script>
// JS
// –– Vuex Helpers
import { mapState } from 'vuex'

// –– Components
import NameSpinner from '../components/name_spinner.vue';


export default {
    components: {
        'name-spinner': NameSpinner,
    },
    computed: {
        current_rank() {
            return this.rank ? this.rank : '?'
        },
        name: {
            get() {
                return this.$store.state.score.user
            },
            set(value) {
                this.$store.dispatch('update_name', value)
            }
        },
        ...mapState({
            rank: state => state.score.rank,
            score: state => state.score.value,
            color: state => state.score.color,
            scores: state => state.score.highscores
        })
    },
    methods: {
        ranking_style(name) {
            let style = {
                background: this.color,
                borderColor: this.color,
                color: "#FFF"
            }
            if(this.name == name) {
                style.background = "#FFF"
                style.color = this.color
            }
            return style
        }
    },
    mounted() {
        this.$store.dispatch('get_highscores')
    }
}
</script>


<style>
.ScorePanel {
    position: relative;
    width: 100%;
    height: 100%;
    padding: 20px 20px;
    box-sizing: border-box;

    background: #FFF;
    color: #000;
    font-weight: bold;
    font-size: 15px;
    transition: color 4s;
    transition: background-color 4s;
    transition: border-color 4s;
}

.ScorePanel
.header {
    display: flex;
    align-items: center;
    width: 100%;
    height: 30%;
    transition: height 0.5s;
}

.ScorePanel
.header.max {
    height: 100%;
}

.ScorePanel
.content {
    width: 100%;
    height: calc(100% - 30%);
    overflow: hidden;
    transition: height 0.5s;
}

.ScorePanel
.content.min {
    height: 0;
}

.ScorePanel
.name {
    position: relative;
    display: flex;
    align-items: center;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    box-sizing: border-box;
    padding: 20px;
    margin: auto;
    font-size: 20px;
    letter-spacing: 2px;
}

.ScorePanel
.name .outer-text {
    position: absolute;
    left: -30px;
    top: -30px;

    width: 180px;
    height: 180px;
}

.ScorePanel
.header
.name .outer-text {
    -webkit-animation: spin-fade .3s 1 linear forwards; /* Safari 4.0 - 8.0 */
            animation: spin-fade .3s 1 linear forwards;
}

.ScorePanel
.header.max
.name .outer-text {
    -webkit-animation: spin 80s infinite linear; /* Safari 4.0 - 8.0 */
            animation: spin 80s infinite linear;
}

.ScorePanel
.name .input {
    z-index: 2;
    display: block;
    width: 100%;
    background: none;
    border: none;
    color: #FFF;
    text-align: center;
    margin-bottom: -4px;

    font-size: inherit;
    font-weight: inherit;
    letter-spacing: inherit;
}

.ScorePanel .input::selection {
    background: #FFF;
    color: inherit;
}

.ScorePanel .input::-moz-selection {
    background: #FFF;
    color: inherit;
}

.ScorePanel
.name .input.underline {
    border-bottom: 5px solid #FFF;
}

.ScorePanel
.name .input.underline:focus {
    border: none;
}

.ScorePanel
.entry {
    display: flex;
    align-items: center;
    background: #FFF;
    padding: 5px;
    border: 5px solid #000;
    box-sizing: border-box;
}

.ScorePanel
.entry .user {
    flex-grow: 1;
    padding: 0px 5px;
    text-align: center;
    font-weight: normal;
    margin-bottom: -2px;
}

.ScorePanel
.scores {
    width: 100%;
    height: calc(100% - 40px);
    margin: 0;
    padding: 0;
    list-style: none;
    overflow: auto;
}

.ScorePanel
.scores .entry {
    margin-bottom: 10px;
}
</style>

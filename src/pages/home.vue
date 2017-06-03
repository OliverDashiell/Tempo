<template>
    <div class="HomePage">
        <div class="slide-containter" :style="positioning">
            <div class="panel left-panel">
                <score-panel></score-panel>
            </div>
            <div class="panel centre-panel">
                <div class="title toggle score" @click="toggle_left">
                    <div class="close" :class="{closeleft:left}">
                        <img class="caret caret-left" src="/src/assets/images/arrow.svg"/>
                    </div>
                    <div class="open" :class="{openleft:left}">SCORE</div>
                </div>
                <div class="title toggle info"  @click="toggle_right">
                    <div class="close" :class="{closeright:right}">
                        <img class="caret caret-right" src="/src/assets/images/arrow.svg" />
                    </div>
                    <div class="open" :class="{openright:right}">INFO</div>
                </div>
                <taps-panel></taps-panel>
            </div>
            <div class="panel right-panel">
                <info-panel></info-panel>
            </div>
        </div>
    </div>
</template>


<script>
// JS
// –– Vuex Helpers
import { mapState } from 'vuex'

// –– Dependencies
import event_bus from '../event.js';

// –– Panels
import ScorePanel from '../panels/score.vue';
import TapsPanel from '../panels/taps.vue';
import InfoPanel from '../panels/info.vue';


export default {
    components: {
        'score-panel': ScorePanel,
        'taps-panel': TapsPanel,
        'info-panel': InfoPanel,
    },
    data() {
        return { show: null }
    },
    computed: {
        left() {
            return this.show == 'left'
        },
        right() {
            return this.show == 'right'
        },
        positioning() {
            if(this.show == 'left') {
                return {left:'0px'}
            }
            else if(this.show == 'right') {
                return {left:'-600px'}
            }
            else {
                return {left:'-300px'}
            }
        },
        ...mapState({
            color: state => state.score.color
        })
    },
    methods: {
        toggle_left() {
            this.show = this.show == 'left' ? null : 'left'
        },
        toggle_right() {
            this.show = this.show == 'right' ? null : 'right'
        },
    },
    mounted() {
        event_bus.$on('score', this.toggle_left)
        event_bus.$on('info', this.toggle_right)
    }
}
</script>


<style>
.HomePage {
    position: relative;
    width: 100%;
    height: 100%;
}

.HomePage
.slide-containter {
    position: absolute;
    top: 0; bottom: 0;
    left: 0; right: 0;
    width: 100%;

    white-space: nowrap;
    font-size: 0;
    transition: all 0.5s;
}

.HomePage
.panel {
    position: relative;
    display: inline-block;
    font-size: medium;
    vertical-align: top;
    max-width: 100%;
    min-width: 300px;
    height: 100%;
    box-sizing: border-box;
    transition: all .5s;
}
.HomePage .panel.centre-panel {
    width: 100%;
}

.HomePage
.toggle {
    position: absolute;
    top: 20px;
    z-index: 1000;
    cursor: pointer;
}

.HomePage
.toggle.score {
    left: 20px;
    text-align: left;
}

.HomePage
.toggle.info {
    right: 20px;
    text-align: right;
}

.HomePage
.close {
    display: inline-block;
    width: 30px;
    height: 30px;
    transform: scale(0);
    transition: transform 0.3s;
}

.HomePage .close.closeleft,
.HomePage .close.closeright{
    transform: scale(1);
}

.HomePage
.close .caret {
    display: block;
    max-width: 100%;
    max-height: 100%;
}

.HomePage
.close .caret-right {
    transform: rotate(180deg);
}

.HomePage
.open {
    transition: all 0.3s;
    margin-top: -30px;
}

.HomePage
.open.openleft {
    transform-origin: left;
    transform: rotate(90deg);
    margin-left: 14px;
    margin-top: 0;
}

.HomePage
.open.openright {
    transform-origin: right;
    transform: rotate(-90deg);
    margin-right: 14px;
    margin-top: 0;
}
</style>

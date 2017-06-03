<template>
    <div class="TapsPanel noselect" :style="{background:background}">
        <div class="current-score">
            <div class="display-over"
                 @click="tap"
                 :style="{color:color, zIndex:taps+2}">{{taps}}</div>
             <div class="button" :style="{zIndex:taps+1}">
                 <div class="inner"></div>
             </div>
            <div class="circle"
                 v-for="circle in circles"
                 v-if="in_range(circle.index)"
                 :id="circle.index"
                 :style="{background:circle.color, zIndex:circle.index}"
                 :class="{enlarge:started}"></div>
        </div>
    </div>
</template>


<script>
// JS
// –– Vuex Helpers
import { mapState } from 'vuex'

// –– Dependencies
import { Howl } from 'howler'
import _ from 'lodash'
import event_bus from '../event.js';


export default {
    data() {
        return {
            started: false,
            background: "#E57373",
            circles: [],
            colors: [
                '#E57373', '#F06292', '#BA68C8', '#9575CD', '#7986CB',
                '#64B5F6', '#4DD0E1', '#4DB6AC', '#81C784', '#AED581',
                '#DCE775', '#FFF176', '#FFF176', '#FFB74D', '#FF8A65'
            ],
            samples: {
                high: null,
                middle: null,
                low: null
            },
            ambience: null,
            backing: null,
            echos: null,
            ranges: ['high','middle','low'],
            notes: ['C','D','E','G','A']
        }
    },
    computed: {
        color: {
            get() {
                return this.$store.state.score.color
            },
            set(value) {
                this.$store.dispatch('update_color', value)
            }
        },
        taps: {
            get() {
                return this.$store.state.score.value
            },
            set(value) {
                this.$store.dispatch('update_value', value)
            }
        }
    },
    methods: {
        init() {
            // clear circles
            this.circles = []
            // select a background color
            let color = this.select(this.colors)
            this.background = color
            this.color = color
            // set an initial circle
            this.circles.push({index:0,color:color})
            // start state
            if(!this.started) {
                // startup tones
                setTimeout(() => this.samples.middle.play('C'), 100)
                setTimeout(() => this.samples.middle.play('D'), 200)
                setTimeout(() => this.samples.middle.play('E'), 300)
                setTimeout(() => this.samples.middle.play('G'), 400)
                setTimeout(() => this.samples.middle.play('A'), 500)
            }
            else {
                this.started = false
            }
        },
        tap() {
            // trigger start
            if(!this.started) {
                this.started=true
                this.backing.play()
            }
            // increment taps
            this.taps++
            // add circle animation
            this.add_circle()
            // trigger sound
            this.play_sound()
        },
        play_sound() {
            // begin with at least one middle note
            let note = this.select(this.notes)
            let range = 'middle'
            let played = [range]
            // play 3 notes
            for(var i = 0; i < 3; i++) {
                // play the note in the selected range
                this.samples[range].play(note)
                // select next range
                range = this.select(this.ranges)
                // exclude the last note if range is the same
                note = played[i] == range ? this.select(this.notes, [note])
                                          : this.select(this.notes)
                // push range to played
                played.push(range)
            }
            // randomly play an echo note
            this.random_echo()
        },
        add_circle() {
            // get index of last added circle
            var index = this.taps
            // select a color excluding the last one
            var color = this.select(this.colors, [this.circles[index-1].color])
            // wait until next cycle
            this.$nextTick(() => {
                // add circle
                this.circles.push({index:index, color:color})
                // change score text color
                this.color = color
            })
        },
        in_range(index) {
            return (this.taps - index) < 30
        },
        select(array, exclude) {
            let selection = this.randomise(array)
            if(exclude) {
                while(_.includes(exclude,selection)) {
                    selection = this.randomise(array)
                }
            }
            return selection
        },
        randomise(array) {
            return array[Math.floor(Math.random() * array.length)]
        },
        random_echo() {
            // only sometimes
            let chance = Math.random()
            if(chance > 0.6) {
                let note = this.select(this.notes)
                setTimeout(() => this.echos.play(note), 600);
            }
        }
    },
    created() {
        // sprite sample sets
        let note_sprite = {
            C: [0, 1840],
            D: [1840, 1840],
            E: [3690, 1840],
            G: [5530, 1840],
            A: [7380, 1840]
        }
        let echo_sprite = {
            C: [0, 2740],
            D: [2740, 2740],
            E: [5480, 2740],
            G: [8220, 2740],
            A: [10970, 2740]
        }

        // setup note samples
        this.samples.high = new Howl({
            src: ['./src/assets/audio/high_notes.wav'],
            sprite: note_sprite,
            volume: 0.7
        })
        this.samples.middle = new Howl({
            src: ['./src/assets/audio/notes.wav'],
            sprite: note_sprite,
            volume: 1
        })
        this.samples.low = new Howl({
            src: ['./src/assets/audio/low_notes.wav'],
            sprite: note_sprite,
            volume: 0.7
        })

        // echos
        this.echos = new Howl({
            src: ['./src/assets/audio/echos.wav'],
            sprite: echo_sprite,
            volume: 1
        })

        // ambient track
        // this.ambience = new Howl({
        //     src:['./src/assets/audio/ambience.wav'],
        //     autoplay: true,
        //     loop: true,
        //     volume: 1
        // })

        // backing for play
        this.backing = new Howl({
            src: ['./src/assets/audio/backing.wav'],
            volume: 1
        })
    },
    mounted() {
        // setup start
        this.init()
    }
}
</script>


<style>
.TapsPanel {
    position: relative;
    display: flex;
    align-items: center;

    width: 100%;
    height: 100%;
    overflow: hidden;
    text-align: center;
}

.TapsPanel
.current-score {
    height: 150px;
    width: 150px;
    margin: auto;
}

.TapsPanel .current-score .button,
.TapsPanel .current-score .display-over {
    position: absolute;
    top: Calc(50% - 150px/2);
    left: Calc(50% - 150px/2);

    height: 150px;
    width: 150px;

    line-height: 150px;
    font-size: 40px;
    font-weight: bold;
    text-align: center;
    cursor: pointer;
}

.TapsPanel
.current-score
.button .display-over {
    margin-top: -100%;
}

.TapsPanel
.current-score
.button .inner {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: #FFF;
    transition: transform 0.2s;
}

.TapsPanel
.current-score
.display-over:active + .button
.inner {
    transform: scale(.7);
}

.TapsPanel
.circle {
    position: absolute;
    top: Calc(50% - 150px/2);
    left: Calc(50% - 150px/2);

    width: 150px;
    height: 150px;
    border-radius: 50%;
}


.TapsPanel
.enlarge {
    -webkit-animation: enlarge 4s linear forwards;
}

@-webkit-keyframes enlarge {
    0% {
        top: Calc(50% - (150px/2));
        left: Calc(50% - (150px/2));
        width: 150px; height: 150px;
    }
    100% {
        top: Calc(50% - (150px/2) - 1000px);
        left: Calc(50% - (150px/2) - 1000px);
        width: 2150px; height: 2150px;
    }
}

.TapsPanel
.canvas {
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
}
</style>
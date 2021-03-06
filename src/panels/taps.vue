<template>
    <div class="TapsPanel noselect" :style="{background:background}">
        <div class="current-score">
            <div class="display-over" @click="handle"
                 :style="{color:color}">
                 <div v-if="stage=='go'">START</div>
                 <div v-else-if="show_score">{{taps}}</div>
             </div>
             <div class="button" ref="button">
                 <div class="inner"></div>
             </div>
            <div class="circle enlarge"
                 v-for="circle in circles"
                 :style="{background:circle.color, zIndex:circle.index}"></div>
            <img class="instruction"
                 :class="[instruction_state]"
                 v-if="current_instruction"
                 :src="current_instruction"/>
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

// –– Events
import event_bus from '../event.js'


// STUPID YELLOW - '#FFF176'

export default {
    data() {
        return {
            stage: null,
            surpress_clicks: false,
            transition_state: null,
            deltas: [],
            timer: null,
            last_tap: null,
            background: '#E57373',
            circles: [],
            colors: [
                '#E57373', '#F06292', '#BA68C8', '#9575CD',
                '#7986CB', '#64B5F6', '#4DD0E1', '#4DB6AC',
                '#81C784', '#AED581', '#DCE775', '#FFB74D',
                '#FF8A65', '#FFD54F'
            ],
            samples: {
                high: null,
                middle: null,
                low: null
            },
            ambience: null,
            backing: null,
            backing_id: null,
            echos: null,
            fail: null,
            ranges: ['high','middle','low'],
            notes: ['C','D','E','G','A']
        }
    },
    computed: {
        current_instruction() {
            let skip_stages = ["go","started"]
            let instruction_root = "/src/assets/images/stages/"
            let instruction = null
            if(!_.includes(skip_stages,this.stage)) {
                instruction = instruction_root + this.stage + ".svg"
            }
            return instruction
        },
        instruction_state() {
            return this.transition_state ? this.transition_state : 'holding'
        },
        show_score() {
            // score should be show for all three states
            return this.stage == 'started' ||
                   this.stage == 'ended'   ||
                   this.stage == 'failed'  ||
                   this.stage == 'again'
        },
        layer_index() {
            return this.circles.length
        },
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
        },
        rank: {
            get() {
                return this.$store.state.score.rank
            },
            set(value) {
                this.$store.dispatch('update_rank', value)
            }
        }
    },
    methods: {
        handle() {
            // surpress clicks
            if(this.surpress_clicks) { return }
            // cycle stages
            switch (this.stage) {
                case 'loaded':
                    this.transition_stage("instruction_1")
                    this.play_sound()
                    break
                case 'instruction_1':
                    this.transition_stage("instruction_2")
                    this.play_sound()
                    break
                case 'instruction_2':
                    this.transition_stage("instruction_3")
                    this.play_sound()
                    break
                case 'instruction_3':
                    this.transition_stage("go")
                    event_bus.$emit('home')
                    this.play_sound()
                    break
                case 'go':
                    this.begin()
                    this.play_sound()
                    break
                case 'started':
                    this.tap()
                    break
                case 'ended':
                case 'failed':
                    this.transition_stage("again")
                    // open score screen
                    event_bus.$emit('score')
                    event_bus.$emit('submit_score')
                    this.play_sound()
                    break
                case 'again':
                    this.reset()
                    this.play_sound()
                    break
            }
            // always add circle animation
            this.add_circle()
        },
        reset() {
            // reset home position
            event_bus.$emit('home')
            // select random color or color of last circle
            let color = this.select(this.colors)
            if(this.layer_index > 1) {
                color = this.circles[this.layer_index-1].color
            }
            // clear taps rank and circles
            this.circles = []
            this.taps = 0
            this.rank = null
            // select a background color
            this.background = color
            this.color = color
            // set an initial circle
            this.circles.push({index:0,color:color})
            // start state will have no stage set
            if(this.stage) {
                // cycle back to go
                this.stage = "go"
            }
        },
        begin() {
            // start tracking on next click
            this.stage = "started"
            // begin backing track
            this.crossfade()
            // get timestamp
			let now = Date.now()
            // add initial delta and first tap time
            this.deltas.push(0)
            this.last_tap = now
            // start timer for 30 seconds
            this.timer = setTimeout(() => this.end("ended"), 30000)
        },
        tap() {
            // get timestamp
			let now = Date.now()
            // determine time between last tap and now
			let delta = now - this.last_tap
            // check last delta for slower tap
            if(delta > this.deltas[this.deltas.length-1]) {
                // advance
                this.taps++
                this.deltas.push(delta)
				this.last_tap = now
                this.play_sound()
            } else {
				// fail
                this.end("failed")
                this.fail.play()
			}
        },
        end(stage) {
            // clear timer
            if(this.timer) clearTimeout(this.timer)
            // set end state
            this.stage = stage
            this.transition_stage(stage, false)
            // cross fade to ambience
            this.crossfade()
        },
        transition_stage(stage,forwards=true) {
            // set transition_state
            this.transition_state = forwards ? 'forwards' : 'backwards'
            // stop user click during transition
            this.surpress_clicks = true
            // clear after transition has had time to run
            setTimeout(() => {
                this.stage = stage
                this.surpress_clicks = false
                this.transition_state = null
            }, 500);
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
            // randomly play an echo note during game
            if(this.stage == 'started') this.random_echo()
        },
        add_circle() {
            // select a color excluding the last one selected
            var color = this.select(this.colors, [this.circles[this.layer_index-1].color])
            // wait until next cycle
            this.$nextTick(() => {
                // add circle
                this.circles.push({index:this.layer_index, color:color})
                // change score text color
                this.color = color
            })
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
        },
        crossfade() {
            if(this.stage == 'started') {
                // begin backing
                this.backing_id = this.backing.play()
                this.backing.fade(0,1,1000)
                // fade out ambience
                this.ambience.fade(1,0,1000)
            }
            else {
                // determine fadeout duration
                let fade_duration = 2000
                if(this.stage == "failed") fade_duration = 100

                // check if backing is playing
                if(this.backing_id) {
                    // callback to stop track on fade
                    this.backing.on('fade',() => {
                        // stop and clear the backing id
                        this.backing.stop(this.backing_id)
                        this.backing_id = null
                    }, this.backing_id)
                    // fade out backing
                    this.backing.fade(1,0,fade_duration,this.backing_id)
                }
                // fade ambience back in
                this.ambience.fade(0,1,1000)
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
            volume: 0.6
        })

        // fail tone
        this.fail = new Howl({
            src: ['./src/assets/audio/fail.wav'],
            volume: 1
        })

        // ambient track
        this.ambience = new Howl({
            src:['./src/assets/audio/ambience.wav'],
            autoplay: true,
            loop: true,
            volume: 1
        })

        // backing for play
        this.backing = new Howl({
            src: ['./src/assets/audio/backing.wav'],
            volume: 1
        })
    },
    mounted() {
        // setup start
        this.reset()
        // startup ticks
        this.$nextTick(() => {
            // timeout for button
            setTimeout(() => {
                // show button
                this.$refs.button.className += " startup"
                //timeout for startup stage
                setTimeout(() => {
                    // start
                    this.stage = "loaded"
                    this.transition_stage("loaded",false)
                },500)
                // startup tones
                setTimeout(() => this.samples.middle.play('C'), 100)
                setTimeout(() => this.samples.middle.play('D'), 200)
                setTimeout(() => this.samples.middle.play('E'), 300)
                setTimeout(() => this.samples.middle.play('G'), 400)
                setTimeout(() => this.samples.middle.play('A'), 500)
            },10)
        })
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
.display-over {
    z-index: 1001;
}
.TapsPanel .current-score .button,
.TapsPanel .current-score .instruction {
    z-index: 1000;
}

.TapsPanel
.current-score
.button {
    transform: scale(0);
    transition: transform 0.5s;
}

.TapsPanel
.current-score
.button.startup {
    transform: scale(1);
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
    transform: scale(.85);
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
.instruction {
    position: absolute;
    left: calc(50% - 250px/2);
    top: calc(50% - 250px/2);
    width: 250px;
    height: 250px;
}

.TapsPanel
.instruction.holding {
    -webkit-animation: spin 80s infinite linear; /* Safari 4.0 - 8.0 */
            animation: spin 80s infinite linear;
}

.TapsPanel
.instruction.forwards  {
    -webkit-animation: spin-fade 0.3s infinite linear; /* Safari 4.0 - 8.0 */
            animation: spin-fade 0.3s infinite linear;
}

.TapsPanel
.instruction.backwards {
    -webkit-animation: fade-spin 0.3s linear forwards; /* Safari 4.0 - 8.0 */
            animation: fade-spin 0.3s linear forwards;
}

.TapsPanel
.enlarge {
    -webkit-animation: enlarge 4s linear forwards; /* Safari 4.0 - 8.0 */
            animation: enlarge 4s linear forwards;
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
@keyframes enlarge {
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
.pulse {
    -webkit-animation: pulse 3s infinite linear; /* Safari 4.0 - 8.0 */
            animation: pulse 3s infinite linear;
}

@-webkit-keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(0.95); }
    100% { transform: scale(1); }
}
@keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(0.95); }
    100% { transform: scale(1); }
}
</style>

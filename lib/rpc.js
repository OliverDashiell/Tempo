const db = require('./db')

// RPC Methods
const methods = {
    async _auth({cookie}, ctx){
        return null
    },
    async deregister({topic}, ctx){
        if(topic instanceof Array){
            for(t of topic){
                ctx.broadcast.deregister(ctx.websocket, t)
            }
        } else {
            ctx.broadcast.deregister(ctx.websocket, topic)
        }
        return ['done', null]
    },

    async echo({message}, ctx){
        return [message, 'echo']
    },

    async getScores(_, ctx){
        const scores = await db.Score.findAll({
            limit: 5, order:[['score','DESC']]
        })

        ctx.broadcast.register('highscores', ctx.websocket)
        return [scores, null]
    },

    async submitScore({name, score}, ctx){
        await db.Score.create({ name, score })

        // rank will be count of all scores lower
        const result = await db.Score.findAndCountAll({
            where: { score: {$gte:score} }
        })
        const rank = result.count

        // also needs to return new leaderboard
        const scores = await db.Score.findAll({
            limit: 5, order:[['score','DESC']]
        })

        return [{rank,scores}, 'highscores']
    }
}

module.exports = methods

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
        return ["done", null]
    },

    async echo({message}, ctx){
        return [message, 'echo']
    },

    async getScores(_, ctx){
        const scores = await db.Score.findAll();

        ctx.broadcast.register('highscores', ctx.websocket);
        return [scores, null]
    },

    async submitScore({name, score}, ctx){
        await db.Score.create({
            name,
            score
        })

        const scores = await db.Score.findAll();

        return [scores, 'highscores']
    }
}

module.exports = methods;

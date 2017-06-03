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

    async submitScore({score}, ctx){
        return [5, null]
    }
}

module.exports = methods;

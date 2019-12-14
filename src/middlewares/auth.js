const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req, res, next) => {
    try {
        if (!req.headers.authorization)
            throw new Error()
        
        const token = req.headers.authorization.replace('Bearer ', '')
        const info = jwt.decode(token, process.env.JWT_SECRET)
        const user = await User.findOne({ _id: info._id, 'tokens.token': token })

        if (!user)
            throw new Error()
        
        req.token = token
        req.user = user

        next()
    } catch (e) {
        res.status(401).send({ error: 'You are not authenticated' })
    }
}

module.exports = auth
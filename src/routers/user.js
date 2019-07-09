const multer = require('multer')
const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
const User = require('../models/user')
const { sendWelcomeEmail, accountCancellationEmail } = require('../emails/account')

router.get('/test', (req, res) => {
    res.send('From a new file')
})

// Create
router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        res.status(201).send(user)
    } catch (e) {
        res.status(400).send(e)
    }

})

// Sign up
router.post('/users/signup', async (req, res) => {
    const user = new User(req.body)

    try {
        sendWelcomeEmail(user.email, user.name)
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send()
    }
})

// Upload avatar
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload an image'))
        }

        cb(undefined, true)
    }
})
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    req.user.avatar = req.file.buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status('400').send({ error: error.message })
})

// Delete avatar
router.get('/users/me/avatar', auth, async (req, res) => {
    try {
        req.user.avatar = ''
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(400).send()
    }
})

// Get avatar
router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user || !user.avatar) {
            throw new Error()
        }

        res.set('Content-Type', 'image/jpg')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }
})

// Log in
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (e) {
        res.status(400).send()
    }
})

// Log out
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => {
            return token.token !== req.token
        })
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

// Log out everywhere -- wipe out all the tokens for the user
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

// Read all
router.get('/users', auth, async (req, res) => {
    try {
        const users = await User.find({})
        res.status(200).send(users)
    } catch (e) {
        res.status(500).send(e)
    }
})

// Read me
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

// Read one
router.get('/users/:id', async (req, res) => {
    const _id = req.params.id

    try {
        const user = await User.findById(_id)
        if (!user) {
            return res.status(404).send()
        }
        res.status(200).send(user)
    } catch (e) {
        res.status(500).send(e)
    }
})

// Update
router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedupdates = ['name', 'email', 'password', 'age']
    const isvalidoperation = allowedupdates.every(update => allowedupdates.includes(update))

    if (!isvalidoperation) {
        return res.status(400).send({ error: 'invalid updates' })
    }

    try {
        updates.forEach(update => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        console.log(e)
        res.status(400).send()
    }
})

// Delete
router.delete('/users/me', auth, async (req, res) => {
    try {
        accountCancellationEmail(req.user.email, req.user.name)
        await req.user.remove()
        res.send(req.user)
    } catch (e) {
        res.status(500).send
    }
})

module.exports = router

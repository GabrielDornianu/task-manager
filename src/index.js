const express = require('express')
require('./db/mongoose')
const User = require('./models/user')
const Task = require('./models/task')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()
const port = process.env.PORT

app.get('/', (req, res) => {
    res.send('<H1>This is just a demo api so far. But be sure it wont stay like this forever.</h1>')
})

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
    console.log(`Server is up on port ${port}`)
})

//const jwt = require('jsonwebtoken')

//const myFunction = async () => {
//    const token = jwt.sign({ _id: 'abc123' }, 'thisismynewcourse', { expiresIn: '7 days' })
//    console.log(token)

//    const data = jwt.verify(token, 'thisismynewcourse')
//}

//myFunction()

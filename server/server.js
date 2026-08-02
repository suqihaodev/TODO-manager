const express = require('express')

const app = express()
app.use(express.json())

const port = 3000

let todo = [
    {id: 1, name: "homework math", priority: "high", completed: false},
    {id: 2, name: "homework english", priority: "high", completed: false},
    {id: 3, name: "homework spanish", priority: "low", completed: true},
]

app.get('/view', (req, res) => {
    res.json(todo)
})

app.post('/add', (req, res) =>{
    const new_task = req.body
    todo.push(new_task)
    res.json(new_task)
})

app.delete('/delete', (req, res) => {
    const { id } = req.body

    if (!id) {
        return res.status(400).json({error: "MISSING ID"})
    }

    const exists = todo.find(_ => _.id === Number(id))
    if (!exists) {
        return res.status(404).json({ error: "TASK NOT FOUND" })
    }
    todo = todo.filter(_ => _.id !== Number(id))
    res.json(todo)

})

app.put('/edit', (req, res) => {
    const {id, name, priority, completed} = req.body

    if (!id) {
        return res.status(400).json({error: "MISSING ID"})
    }

    const task = todo.find(_ => _.id === Number(id))

    if (!task) {
        return res.status(404).json({ error: "TASK NOT FOUND" })
    }
    if (name !== undefined) task.name = name
    if (priority !== undefined) task.priority = priority
    if (completed !== undefined) task.completed = completed
    res.json(todo)
})

app.listen(port, () => {
    console.log(`Server started on port ${port}`)
})
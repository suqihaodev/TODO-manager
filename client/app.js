console.log("TODO MANAGER \n")


const readline = require('node:readline/promises')
const { stdin, stdout } = require('node:process')

async function ask() {
    const rl = readline.createInterface({ input: stdin, output: stdout })
    const action = await rl.question("> ")
    rl.close()
    return action
}


async function menu() {

    console.log(`Select action:
    [1] VIEW TASKS
    [2] CREATE TASK
    [3] EDIT TASK
    [4] DELETE TASK
    [5] EXIT\n`)

    return await ask()

}

async function view_tasks() {
    const raw_res = await fetch("http://localhost:3000/view")
    const tasks = await raw_res.json()

    console.log("\n -------------- TASKS -------------- \n")
    for(const t of tasks) {
        console.log(`\t- ${t.name}`)
        console.log(`\t  ID: ${t.id}`)
        console.log(`\t  Priority: ${t.priority}`)
        console.log(`\t  Completed: ${t.completed}`)
        console.log()
    }
    console.log("----------------------------------- \n")

}

async function add_task() {
    console.log("\n --------- CREATE TASK -----------")
    console.log("Task name: ")
    const name = await ask("")

    console.log("Task priority [1: High | 2: Low]: ")
    let priority = await ask("")
    if (priority.trim() === '1') priority = "high"
    else priority = "low"

    const new_task = {
        id: Date.now(),
        name: name,
        priority: priority,
        completed: false
    }

    const res = await fetch("http://localhost:3000/add", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(new_task)
    })

    if (res.ok) {
        console.log("TASK SUCCESFULLY ADDED\n")
    } else {
        const errorData = await res.text()
        console.log(`ERROR: ${errorData.error}`)
    }
}

async function delete_task() {
    await view_tasks()

    console.log("ID of the task to delete: ")
    let id = await ask()
    id = Number(id.trim())

    if (!id || isNaN(id)) {
        console.log("ERROR: INVALID ID")
        return
    }

    const res = await fetch("http://localhost:3000/delete", {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({id})
    })

    if (res.ok) {
        console.log("TASK SUCCESFULLY DELETED\n")
    } else {
        const errorData = await res.text()
        console.log(`ERROR: ${errorData.error}`)
    }

}

async function edit_task() {
    await view_tasks()
    console.log("ID of the task to edit: ")

    let id = await ask()

    if (!id || isNaN(id)) {
        console.log("ERROR: INVALID ID")
        return
    }

    console.log("--------- PRESS ENTER TO SKIP ---------")
    console.log("New name: ")
    const name = await ask()

    console.log("New priority [1: High | 2: Low]: ")
    const priorityInput = await ask()
    let priority = undefined
    if (priorityInput.trim() === '1') priority = "high"
    if (priorityInput.trim() === '2') priority = "low"

    console.log("Completed [1: Yes | 2: No]: ")
    const completedInput = await ask()
    let completed = undefined
    if (completedInput.trim() === '1') completed = true
    if (completedInput.trim() === '2') completed = false

    const bodyData = { id }

    if (name.trim() !== "") bodyData.name = name.trim()
    if (priority !== undefined) bodyData.priority = priority
    if (completed !== undefined) bodyData.completed = completed

    const res = await fetch("http://localhost:3000/edit", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(bodyData)
    })

    if (res.ok) {
        console.log("TASK SUCCESFULLY UPDATED\n")
    } else {
        const errorData = await res.text()
        console.log(`ERROR: ${errorData.error}`)
    }
}

async function main() {
    let run = true
    while (run) {

        const action = await menu()

        switch (action.trim()) {
            case '1':
                await view_tasks()
                break
            case '2':
                await add_task()
                break
            case '3':
                await edit_task()
                break
            case '4':
                await delete_task()
                break
            case '5':
                run = false
                break
        }

    }

    console.log("Program finished")
}

main()
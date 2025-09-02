const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect('mongodb://127.0.0.1:27017/todo')
const taskschema = new mongoose.Schema({
    task:String,
    priority:String
})
const item = mongoose.model('task',taskschema);


// Routes
app.get("/", async(req, res) => {

   try {
    const founditems = await item.find({});
    let filter = req.query.filter || "all";
    let filteredTodos = founditems;

    if(filter !== "all"){
        filteredTodos = founditems.filter(todo => todo.priority === filter);
    }
     res.render("list", { todos: filteredTodos, filter });
   } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching tasks");
   }

});

// Add Todo

app.post("/add", async (req, res) => {
    let task = req.body.task.trim();
    let priority = req.body.priority;

    if (task === "") {
        return res.send('<script>alert("Task cannot be empty!"); window.location.href="/";</script>');
    }
    try{
        const usertask = new item({
            task : task,
            priority:priority
        });
        await usertask.save();
        return res.send('<script>alert("Task Added Successfully!"); window.location.href="/";</script>');
    }
    catch(err){
     console.error(err);
    return res.send('<script>alert("Error adding task!"); window.location.href="/";</script>');
    }
});

// // Edit Todo
app.post("/edit", async (req, res) => {

     let id = req.body.index;
     let updatedTask = req.body.updatedTask.trim();
    let updatedPriority = req.body.updatedPriority;

    if (updatedTask === "") {
        return res.send('<script>alert("Task cannot be empty!"); window.location.href="/";</script>');
    }
    try {
        await item.findByIdAndUpdate(id,{$set :{task:updatedTask,priority : updatedPriority}});
        return res.send('<script>alert("Task Successfully Update ..");window.location.href="/";</script>');
    } catch (error) {
        console.log(error);
        return res.send('<script>alert("Error updating Task ..");window.location.href="/";</script>');

    }

});

// // Delete Todo

app.post("/delete", async (req, res) => {
    try {
        let id = req.body.index;
        await item.findByIdAndDelete(id);
        return res.send('<script>alert("Task Deleted Successfully"); window.location.href="/";</script>');
    } catch (error) {
        console.log(error);
        return res.send('<script>alert("Error deleting task!"); window.location.href="/";</script>');
    }
});

app.listen(3001, () => {
    console.log("Server started on port 3001");
});

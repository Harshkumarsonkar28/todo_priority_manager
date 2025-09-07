const express = require("express");
const bodyParser = require("body-parser");
const methodOverride = require('method-override');
const mongoose = require('mongoose');

const app = express();
app.use(methodOverride('_method'));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const uri = 'mongodb+srv://harshkumarsonkar55940_db_user:DWTWhvypEpKDwU2H@cluster0.zmsoirj.mongodb.net/todolist?retryWrites=true&w=majority&ssl=true';

// Connect to MongoDB
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of hanging
    ssl: true,
})
.then(() => console.log(" MongoDB Atlas Connected Successfully"))
.catch(err => console.error(" MongoDB Connection Error:", err));

// Schema
const taskschema = new mongoose.Schema({
    task: String,
    priority:String
});
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
app.put("/todos/:id", async (req, res) => {

     let id = req.params.id;
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

app.delete("/todos/:id", async (req, res) => {
    try {
        let id = req.params.id;
        await item.findByIdAndDelete(id);
        return res.send('<script>alert("Task Deleted Successfully"); window.location.href="/";</script>');
    } catch (error) {
        console.log(error);
        return res.send('<script>alert("Error deleting task!"); window.location.href="/";</script>');
    }
});

app.listen(3001, () => {
    console.log("Server started on http://localhost:3001");
});

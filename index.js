require('dotenv').config(); // Load .env first
const express = require("express");
const bodyParser = require("body-parser");
const methodOverride = require('method-override');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error(" ERROR: MONGO_URI is missing! Add it in .env or Render Environment Variables.");
    process.exit(1); // Stop the app if URI is missing
}

const app = express();
app.use(methodOverride('_method'));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Connect to MongoDB
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    ssl: true,
})
.then(() => console.log(" MongoDB Atlas Connected Successfully"))
.catch(err => {
    console.error(" MongoDB Connection Error:", err.message);
    process.exit(1);
});

// Schema
const taskSchema = new mongoose.Schema({
    task: String,
    priority: String
});
const Item = mongoose.model('task', taskSchema);

// ROUTES

// Home - List Tasks
app.get("/", async (req, res) => {
    try {
        const allTasks = await Item.find({});
        let filter = req.query.filter || "all";
        let filteredTasks = allTasks;

        if (filter !== "all") {
            filteredTasks = allTasks.filter(task => task.priority === filter);
        }

        res.render("list", { todos: filteredTasks, filter });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching tasks from DB");
    }
});

// Add Task
app.post("/add", async (req, res) => {
    const task = req.body.task.trim();
    const priority = req.body.priority;

    if (!task) {
        return res.send('<script>alert("Task cannot be empty!"); window.location.href="/";</script>');
    }

    try {
        const newTask = new Item({ task, priority });
        await newTask.save();
        return res.send('<script>alert("Task Added Successfully!"); window.location.href="/";</script>');
    } catch (err) {
        console.error(err);
        return res.send('<script>alert("Error adding task!"); window.location.href="/";</script>');
    }
});

// Edit Task
app.put("/todos/:id", async (req, res) => {
    const id = req.params.id;
    const updatedTask = req.body.updatedTask.trim();
    const updatedPriority = req.body.updatedPriority;

    if (!updatedTask) {
        return res.send('<script>alert("Task cannot be empty!"); window.location.href="/";</script>');
    }

    try {
        await Item.findByIdAndUpdate(id, { task: updatedTask, priority: updatedPriority });
        return res.send('<script>alert("Task Updated Successfully!"); window.location.href="/";</script>');
    } catch (err) {
        console.error(err);
        return res.send('<script>alert("Error updating task!"); window.location.href="/";</script>');
    }
});

// Delete Task
app.delete("/todos/:id", async (req, res) => {
    const id = req.params.id;

    try {
        await Item.findByIdAndDelete(id);
        return res.send('<script>alert("Task Deleted Successfully!"); window.location.href="/";</script>');
    } catch (err) {
        console.error(err);
        return res.send('<script>alert("Error deleting task!"); window.location.href="/";</script>');
    }
});

// Start server
app.listen(PORT, () => {
    console.log(` Server started on http://localhost:${PORT}`);
});

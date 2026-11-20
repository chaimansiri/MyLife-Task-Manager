
// ==========================================
// 1. GET HTML ELEMENTS
// ==========================================

// TASK ELEMENTS

const taskForm = document.getElementById("task-form");
const openTaskForm = document.getElementById("open-task-form");
const cancelTask = document.getElementById("cancel-task");

const taskName = document.getElementById("task-name");
const taskCategory = document.getElementById("task-category");
const taskPriority = document.getElementById("task-priority");
const taskDate = document.getElementById("task-date");
const taskTime = document.getElementById("task-time");

const taskList = document.getElementById("task-list");

const categoryFilter = document.getElementById("category-filter");
const dateFilter = document.getElementById("date-filter");

// HABIT ELEMENTS

const habitForm = document.getElementById("habit-form");
const openHabitForm = document.getElementById("open-habit-form");
const cancelHabit = document.getElementById("cancel-habit");

const habitName = document.getElementById("habit-name");
const habitCategory = document.getElementById("habit-category");

const habitList = document.getElementById("habit-list");


// ==========================================
// 2. LOCAL STORAGE
// ==========================================

function loadData(key) {
    try {
        const data = JSON.parse(localStorage.getItem(key));
        return Array.isArray(data) ? data : [];
    } catch (error) {
        return [];
    }
}

let tasks = loadData("myLifeTasks");
let habits = loadData("myLifeHabits");

let editingTaskId = null;

function saveTasks() {
    localStorage.setItem("myLifeTasks", JSON.stringify(tasks));
}

function saveHabits() {
    localStorage.setItem("myLifeHabits", JSON.stringify(habits));
}


// ==========================================
// 3. DATE FUNCTIONS
// ==========================================

function getToday() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function displayCurrentDate() {
    const currentDate = document.getElementById("current-date");

    currentDate.textContent = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}


// ==========================================
// 4. TASK FORM
// ==========================================

openTaskForm.addEventListener("click", function () {
    taskForm.classList.remove("hidden");
    taskName.focus();
});

cancelTask.addEventListener("click", function () {
    resetTaskForm();
});

function resetTaskForm() {
    taskForm.reset();
    taskForm.classList.add("hidden");

    editingTaskId = null;

    taskForm.querySelector('button[type="submit"]').textContent =
        "Save Task ♡";
}


// ==========================================
// 5. ADD OR EDIT TASK
// ==========================================

taskForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const name = taskName.value.trim();
    const category = taskCategory.value;
    const priority = taskPriority.value;
    const date = taskDate.value;
    const time = taskTime.value;

    if (name === "" || date === "") {
        alert("Please enter the task name and date.");
        return;
    }

    if (editingTaskId !== null) {

        const task = tasks.find(t => t.id === editingTaskId);

        if (task) {
            task.name = name;
            task.category = category;
            task.priority = priority;
            task.date = date;
            task.time = time;
        }

    } else {

        const newTask = {
            id: Date.now().toString() + Math.random().toString(36).slice(2),
            name: name,
            category: category,
            priority: priority,
            date: date,
            time: time,
            completed: false
        };

        tasks.push(newTask);
    }

    saveTasks();
    resetTaskForm();
    displayTasks();

});


// ==========================================
// 6. DISPLAY TASKS
// ==========================================

function displayTasks() {

    taskList.innerHTML = "";

    const selectedCategory = categoryFilter.value;
    const selectedDate = dateFilter.value;
    const today = getToday();

    const filteredTasks = tasks.filter(task => {

        const categoryMatch =
            selectedCategory === "All" ||
            task.category === selectedCategory;

        let dateMatch = true;

        if (selectedDate === "Today") {
            dateMatch = task.date === today;
        }

        if (selectedDate === "Upcoming") {
            dateMatch = task.date > today;
        }

        if (selectedDate === "Overdue") {
            dateMatch = task.date < today && !task.completed;
        }

        return categoryMatch && dateMatch;
    });

    // Sort tasks by date and time

    filteredTasks.sort((a, b) => {
        return (a.date + a.time).localeCompare(b.date + b.time);
    });

    if (filteredTasks.length === 0) {

        const emptyMessage = document.createElement("p");
        emptyMessage.className = "empty-message";
        emptyMessage.textContent = "No tasks found. Add a new task ♡";

        taskList.appendChild(emptyMessage);
    }

    filteredTasks.forEach(task => {

        const taskElement = document.createElement("div");
        taskElement.className = "task";

        if (task.completed) {
            taskElement.classList.add("completed-task");
        }

        // Task information

        const taskInfo = document.createElement("div");
        taskInfo.className = "task-info";

        const title = document.createElement("h3");
        title.textContent = task.name;

        const details = document.createElement("p");

        details.textContent =
            `${task.category} | ${task.priority} | ${task.date}` +
            (task.time ? ` | ${task.time}` : "");

        taskInfo.append(title, details);

        // Buttons

        const actions = document.createElement("div");
        actions.className = "task-actions";

        // Complete button

        const completeButton = document.createElement("button");

        completeButton.textContent =
            task.completed ? "Undo" : "Complete";

        completeButton.addEventListener("click", function () {
            toggleTask(task.id);
        });

        // Edit button

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";

        editButton.addEventListener("click", function () {
            editTask(task.id);
        });

        // Delete button

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", function () {
            deleteTask(task.id);
        });

        actions.append(completeButton, editButton, deleteButton);

        taskElement.append(taskInfo, actions);

        taskList.appendChild(taskElement);

    });

    updateTaskStatistics();
}


// ==========================================
// 7. COMPLETE OR UNDO TASK
// ==========================================

function toggleTask(id) {

    const task = tasks.find(t => t.id === id);

    if (!task) return;

    task.completed = !task.completed;

    saveTasks();
    displayTasks();
}


// ==========================================
// 8. EDIT TASK
// ==========================================

function editTask(id) {

    const task = tasks.find(t => t.id === id);

    if (!task) return;

    editingTaskId = id;

    taskName.value = task.name;
    taskCategory.value = task.category;
    taskPriority.value = task.priority;
    taskDate.value = task.date;
    taskTime.value = task.time;

    taskForm.classList.remove("hidden");

    taskForm.querySelector('button[type="submit"]').textContent =
        "Update Task ♡";

    taskForm.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}


// ==========================================
// 9. DELETE TASK
// ==========================================

function deleteTask(id) {

    const confirmation = confirm(
        "Are you sure you want to delete this task?"
    );

    if (!confirmation) return;

    tasks = tasks.filter(task => task.id !== id);

    saveTasks();
    displayTasks();
}


// ==========================================
// 10. TASK FILTERS
// ==========================================

categoryFilter.addEventListener("change", displayTasks);
dateFilter.addEventListener("change", displayTasks);


// ==========================================
// 11. TASK STATISTICS
// ==========================================

function updateTaskStatistics() {

    const total = tasks.length;

    const completed = tasks.filter(
        task => task.completed
    ).length;

    const pending = total - completed;

    document.getElementById("total-tasks").textContent = total;

    document.getElementById("completed-tasks").textContent =
        completed;

    document.getElementById("pending-tasks").textContent =
        pending;

    const percentage = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    document.getElementById("progress-fill").style.width =
        percentage + "%";

    document.getElementById("progress-text").textContent =
        percentage + "% completed";
}


// ==========================================
// 12. HABIT FORM
// ==========================================

openHabitForm.addEventListener("click", function () {
    habitForm.classList.remove("hidden");
    habitName.focus();
});

cancelHabit.addEventListener("click", function () {
    habitForm.reset();
    habitForm.classList.add("hidden");
});


// ==========================================
// 13. ADD NEW HABIT
// ==========================================

habitForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const name = habitName.value.trim();
    const category = habitCategory.value;

    if (name === "") {
        alert("Please enter a habit name.");
        return;
    }

    const newHabit = {
        id: Date.now().toString() + Math.random().toString(36).slice(2),
        name: name,
        category: category,
        completedDates: []
    };

    habits.push(newHabit);

    saveHabits();

    habitForm.reset();
    habitForm.classList.add("hidden");

    displayHabits();

});


// ==========================================
// 14. DISPLAY HABITS
// ==========================================

function displayHabits() {

    habitList.innerHTML = "";

    const today = getToday();

    if (habits.length === 0) {

        const message = document.createElement("p");
        message.className = "empty-message";
        message.textContent = "No habits yet. Start with a small habit ♡";

        habitList.appendChild(message);
    }

    habits.forEach(habit => {

        const completedToday =
            habit.completedDates.includes(today);

        const card = document.createElement("div");
        card.className = "habit-card";

        if (completedToday) {
            card.classList.add("completed");
        }

        // Habit information

        const info = document.createElement("div");

        const title = document.createElement("h3");
        title.textContent = habit.name;

        const category = document.createElement("p");
        category.textContent = habit.category;

        const status = document.createElement("p");
        status.textContent = completedToday
            ? "Completed today ✓"
            : "Not completed yet";

        info.append(title, category, status);

        // Complete button

        const button = document.createElement("button");

        button.textContent = completedToday
            ? "Undo"
            : "Done ✓";

        button.addEventListener("click", function () {
            toggleHabit(habit.id);
        });

        // Delete button

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", function () {
            deleteHabit(habit.id);
        });

        const actions = document.createElement("div");
        actions.className = "habit-actions";

        actions.append(button, deleteButton);

        card.append(info, actions);

        habitList.appendChild(card);

    });

    updateHabitProgress();
}


// ==========================================
// 15. COMPLETE OR UNDO HABIT
// ==========================================

function toggleHabit(id) {

    const habit = habits.find(h => h.id === id);

    if (!habit) return;

    const today = getToday();

    if (habit.completedDates.includes(today)) {

        habit.completedDates =
            habit.completedDates.filter(date => date !== today);

    } else {

        habit.completedDates.push(today);

    }

    saveHabits();
    displayHabits();
}


// ==========================================
// 16. DELETE HABIT
// ==========================================

function deleteHabit(id) {

    const confirmation = confirm(
        "Are you sure you want to delete this habit?"
    );

    if (!confirmation) return;

    habits = habits.filter(habit => habit.id !== id);

    saveHabits();
    displayHabits();
}


// ==========================================
// 17. HABIT PROGRESS
// ==========================================

function updateHabitProgress() {

    const today = getToday();

    const total = habits.length;

    const completed = habits.filter(habit =>
        habit.completedDates.includes(today)
    ).length;

    const percentage = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    document.getElementById("habit-progress-text").textContent =
        `${completed} / ${total} completed`;

    document.getElementById("habit-progress-fill").style.width =
        percentage + "%";
}


// ==========================================
// 18. INITIALIZE APP
// ==========================================

displayCurrentDate();

displayTasks();

displayHabits();

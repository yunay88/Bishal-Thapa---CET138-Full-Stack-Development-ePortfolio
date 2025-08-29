const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const serverLog = document.getElementById('serverLog');

if (!taskForm || !taskInput || !taskList || !serverLog) {
  console.error('One or more DOM elements not found.');
} else {
  function logServer(message) {
    const p = document.createElement('p');
    p.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    serverLog.appendChild(p);
    serverLog.scrollTop = serverLog.scrollHeight; // Auto-scroll to latest log
  }

  function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.forEach(addTaskToDOM);
  }

  function addTaskToDOM(task) {
    const li = document.createElement('li');
    li.textContent = task.text;
    if (task.done) li.style.textDecoration = 'line-through';

    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = task.done ? 'Undo' : 'Done';
    toggleBtn.addEventListener('click', () => toggleTask(task.id));

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    li.append(' ', toggleBtn, ' ', deleteBtn);
    taskList.appendChild(li);
  }

  function toggleTask(id) {
    logServer(`Request: Toggle task ${id}`);
    setTimeout(() => {
      let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
      tasks = tasks.map(t => (t.id === id ? { ...t, done: !t.done } : t));
      localStorage.setItem('tasks', JSON.stringify(tasks));
      taskList.innerHTML = '';
      tasks.forEach(addTaskToDOM);
      logServer(`Response: Task ${id} updated`);
    }, 400);
  }

  function deleteTask(id) {
    logServer(`Request: Delete task ${id}`);
    setTimeout(() => {
      let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
      tasks = tasks.filter(t => t.id !== id);
      localStorage.setItem('tasks', JSON.stringify(tasks));
      taskList.innerHTML = '';
      tasks.forEach(addTaskToDOM);
      logServer(`Response: Task ${id} deleted`);
    }, 400);
  }

  document.addEventListener('DOMContentLoaded', loadTasks);

  taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const taskText = taskInput.value.trim();
    if (!taskText) {
      alert('Please enter a task description.');
      return;
    }

    logServer(`Request: Add new task → ${taskText}`);
    setTimeout(() => {
      const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
      const newTask = { id: Date.now(), text: taskText, done: false };
      tasks.push(newTask);
      localStorage.setItem('tasks', JSON.stringify(tasks));
      logServer(`Response: Task "${taskText}" saved`);
      addTaskToDOM(newTask);
      taskInput.value = '';
    }, 500);
  });
}
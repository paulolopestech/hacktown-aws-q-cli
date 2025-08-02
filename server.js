const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// In-memory storage for todos (in production, use a database)
let todos = [
  { id: 1, text: 'Learn Node.js', completed: false, dueDate: null, createdAt: new Date().toISOString() },
  { id: 2, text: 'Build a todo app', completed: false, dueDate: '2025-08-05', createdAt: new Date().toISOString() }
];
let nextId = 3;

// Routes
// Serve the main HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Get todos by date
app.get('/api/todos/date/:date', (req, res) => {
  const { date } = req.params;
  const todosForDate = todos.filter(todo => todo.dueDate === date);
  res.json(todosForDate);
});

// Get all todos
app.get('/api/todos', (req, res) => {
  res.json(todos);
});

// Add a new todo
app.post('/api/todos', (req, res) => {
  const { text, dueDate } = req.body;
  
  if (!text || text.trim() === '') {
    return res.status(400).json({ error: 'Todo text is required' });
  }

  const newTodo = {
    id: nextId++,
    text: text.trim(),
    completed: false,
    dueDate: dueDate || null,
    createdAt: new Date().toISOString()
  };

  todos.push(newTodo);
  res.status(201).json(newTodo);
});

// Update a todo (toggle completion or edit text)
app.put('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { text, completed, dueDate } = req.body;
  
  const todoIndex = todos.findIndex(todo => todo.id === id);
  
  if (todoIndex === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  if (text !== undefined) {
    todos[todoIndex].text = text.trim();
  }
  
  if (completed !== undefined) {
    todos[todoIndex].completed = completed;
  }

  if (dueDate !== undefined) {
    todos[todoIndex].dueDate = dueDate;
  }

  res.json(todos[todoIndex]);
});

// Delete a todo
app.delete('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const todoIndex = todos.findIndex(todo => todo.id === id);
  
  if (todoIndex === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  const deletedTodo = todos.splice(todoIndex, 1)[0];
  res.json(deletedTodo);
});

// Start server
app.listen(PORT, () => {
  console.log(`Todo app server running on http://localhost:${PORT}`);
});

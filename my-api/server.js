const express = require('express');
const app = express();
app.use(express.json());

// In-memory data
let items = [
  { id: 1, name: 'Item One' },
  { id: 2, name: 'Item Two' }
];

// GET - fetch all items
app.get('/api/items', (req, res) => {
  res.json(items);
});

// POST - add new item
app.post('/api/items', (req, res) => {
  const newItem = { id: items.length + 1, ...req.body };
  items.push(newItem);
  res.status(201).json(newItem);
});

// PUT - update item
app.put('/api/items/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = items.findIndex(i => i.id === id);
  if (index !== -1) {
    items[index] = { id, ...req.body };
    res.json(items[index]);
  } else {
    res.status(404).send('Item not found');
  }
});

// DELETE - remove item
app.delete('/api/items/:id', (req, res) => {
  const id = parseInt(req.params.id);
  items = items.filter(i => i.id !== id);
  res.status(204).send();
});

// Start server
app.listen(3000, () => {
  console.log('API running at http://localhost:3000/api/items');
});

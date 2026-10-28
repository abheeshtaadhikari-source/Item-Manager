const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---- In-memory "database": an array of items ----
let items = [
  { id: 1, name: 'Book', price: 250 },
  { id: 2, name: 'Pen', price: 25 },
];
let nextId = 3;

// Validate and normalise the request body
function validate(body) {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const price = Number(body.price);

  if (!name) return { error: 'Name is required.' };
  if (name.length > 100) return { error: 'Name must be 100 characters or fewer.' };
  if (body.price === '' || body.price === null || body.price === undefined || !Number.isFinite(price)) {
    return { error: 'Price must be a valid number.' };
  }
  if (price < 0) return { error: 'Price cannot be negative.' };

  return { value: { name, price } };
}

const findIndex = (id) => items.findIndex((item) => item.id === Number(id));

// ---- REST API ----

// READ all
app.get('/api/items', (req, res) => {
  res.json(items);
});

// READ one
app.get('/api/items/:id', (req, res) => {
  const index = findIndex(req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Item not found.' });
  res.json(items[index]);
});

// CREATE
app.post('/api/items', (req, res) => {
  const { error, value } = validate(req.body || {});
  if (error) return res.status(400).json({ error });

  const item = { id: nextId++, ...value };
  items.push(item);
  res.status(201).json(item);
});

// UPDATE
app.put('/api/items/:id', (req, res) => {
  const index = findIndex(req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Item not found.' });

  const { error, value } = validate(req.body || {});
  if (error) return res.status(400).json({ error });

  items[index] = { id: items[index].id, ...value };
  res.json(items[index]);
});

// DELETE
app.delete('/api/items/:id', (req, res) => {
  const index = findIndex(req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Item not found.' });

  const [removed] = items.splice(index, 1);
  res.json(removed);
});

// Unknown API routes -> JSON 404
app.use('/api', (req, res) => res.status(404).json({ error: 'Route not found.' }));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

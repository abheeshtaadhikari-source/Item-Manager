(() => {
  const API = '/api/items';

  const form = document.getElementById('item-form');
  const nameInput = document.getElementById('name');
  const priceInput = document.getElementById('price');
  const submitBtn = document.getElementById('submit-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  const formTitle = document.getElementById('form-title');
  const message = document.getElementById('message');
  const tbody = document.getElementById('items-body');
  const emptyState = document.getElementById('empty-state');

  let items = [];
  let editingId = null; // null = creating, otherwise the id being edited

  // ---- Helpers ----
  function showMessage(text, isSuccess = false) {
    message.textContent = text;
    message.classList.toggle('success', isSuccess);
  }

  async function request(url, options = {}) {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
    return data;
  }

  // ---- Rendering ----
  function render() {
    tbody.textContent = '';
    emptyState.hidden = items.length > 0;

    for (const item of items) {
      const tr = document.createElement('tr');
      if (item.id === editingId) tr.classList.add('editing');

      // textContent (not innerHTML) keeps user input safe from XSS
      const idCell = document.createElement('td');
      idCell.textContent = item.id;

      const nameCell = document.createElement('td');
      nameCell.textContent = item.name;

      const priceCell = document.createElement('td');
      priceCell.textContent = item.price;

      const actionCell = document.createElement('td');
      actionCell.className = 'actions';

      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'btn btn-secondary btn-small';
      editBtn.textContent = 'Edit';
      editBtn.dataset.action = 'edit';
      editBtn.dataset.id = item.id;

      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'btn btn-danger btn-small';
      deleteBtn.textContent = 'Delete';
      deleteBtn.dataset.action = 'delete';
      deleteBtn.dataset.id = item.id;

      actionCell.append(editBtn, deleteBtn);
      tr.append(idCell, nameCell, priceCell, actionCell);
      tbody.appendChild(tr);
    }
  }

  function resetForm() {
    editingId = null;
    form.reset();
    formTitle.textContent = 'Add Item';
    submitBtn.textContent = 'Submit';
    cancelBtn.hidden = true;
  }

  // ---- Actions ----
  async function loadItems() {
    try {
      items = await request(API);
      render();
    } catch (err) {
      showMessage(err.message);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    showMessage('');

    const name = nameInput.value.trim();
    const price = priceInput.value;

    // Quick client-side checks (the server validates too)
    if (!name) return showMessage('Name is required.');
    if (price === '' || Number(price) < 0 || !Number.isFinite(Number(price))) {
      return showMessage('Enter a valid, non-negative price.');
    }

    submitBtn.disabled = true;
    try {
      const body = JSON.stringify({ name, price: Number(price) });
      if (editingId === null) {
        await request(API, { method: 'POST', body });
        showMessage('Item added.', true);
      } else {
        await request(`${API}/${editingId}`, { method: 'PUT', body });
        showMessage('Item updated.', true);
      }
      resetForm();
      await loadItems();
    } catch (err) {
      showMessage(err.message);
    } finally {
      submitBtn.disabled = false;
    }
  }

  function startEdit(id) {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    editingId = id;
    nameInput.value = item.name;
    priceInput.value = item.price;
    formTitle.textContent = `Edit Item #${id}`;
    submitBtn.textContent = 'Update';
    cancelBtn.hidden = false;
    showMessage('');
    render();
    nameInput.focus();
  }

  async function deleteItem(id) {
    const item = items.find((i) => i.id === id);
    if (!item || !confirm(`Delete "${item.name}"?`)) return;

    try {
      await request(`${API}/${id}`, { method: 'DELETE' });
      if (editingId === id) resetForm();
      showMessage('Item deleted.', true);
      await loadItems();
    } catch (err) {
      showMessage(err.message);
    }
  }

  // ---- Events ----
  form.addEventListener('submit', handleSubmit);

  cancelBtn.addEventListener('click', () => {
    resetForm();
    showMessage('');
    render();
  });

  // One delegated listener handles every Edit / Delete button
  tbody.addEventListener('click', (event) => {
    const btn = event.target.closest('button[data-action]');
    if (!btn) return;
    const id = Number(btn.dataset.id);
    if (btn.dataset.action === 'edit') startEdit(id);
    else if (btn.dataset.action === 'delete') deleteItem(id);
  });

  loadItems();
})();

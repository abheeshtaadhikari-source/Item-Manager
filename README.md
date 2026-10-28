# Item Manager – CRUD with Express, REST API, HTML & CSS

## Demo Video

https://github.com/user-attachments/assets/73ad769f-a582-475a-ac45-f744ad6e209e

## Run
```
npm install
npm start
```
Open http://localhost:3000

## REST API
| Method | Endpoint         | Description     | Success |
|--------|------------------|-----------------|---------|
| GET    | /api/items       | List all items  | 200     |
| GET    | /api/items/:id   | Get one item    | 200     |
| POST   | /api/items       | Create an item  | 201     |
| PUT    | /api/items/:id   | Update an item  | 200     |
| DELETE | /api/items/:id   | Delete an item  | 200     |

Body for POST/PUT: `{ "name": "Book", "price": 250 }`
Errors return `{ "error": "message" }` with 400 (validation) or 404 (not found).

## Structure
```
server.js          Express server + in-memory array + REST API
public/index.html  Form + items table (matches the sketch)
public/style.css   Styling
public/app.js      fetch() calls, table rendering, edit/delete handling
```
Data lives in an in-memory array, so it resets when the server restarts.

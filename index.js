const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();



let persons = [
  { 
    "id": 1,
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": 2,
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": 3,
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": 4,
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  },
  { 
    "id": 5,
    "name": "John Poppendieck", 
    "number": "99-23-6423122"
  }
];

app.use(cors());
app.use(express.static('build'));
app.use(express.json());
morgan.token('toke', function (req, res) { return JSON.stringify(req.body) })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :toke'));

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/info', (request, response) => {
  let peopleLength = persons.length;
  console.log('length', peopleLength);
  response.send(`<p>There are ${peopleLength} people in phonebook</p><p>${new Date()}</p>` );
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find(person => person.id === id)
  if (person) {
  response.json(person);
  } else {
    response.status(404).end();
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter(person => person.id !== id);

  response.status(204).end();
})

const generateId = () => {
  const personId = Math.ceil(Math.random() *1000000);
  return personId;
}

app.post('/api/persons', (request, response) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({ 
      error: 'content missing from user request' 
    })
  }

  if (persons.find(person => person.name.toLowerCase() === body.name.toLowerCase())){
    return response.status(400).json({
      error: 'person exists already in database'
    })
  }

  const person = {
    name: body.name,
    number: body.number,
    id: generateId(),
  }
  persons = persons.concat(person);
  // console.log(person)
  response.json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, (() => {
  console.log(`Server running on port ${PORT}`)
}))
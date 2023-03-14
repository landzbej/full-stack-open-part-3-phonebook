require('dotenv').config()

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const Note = require('./models/note');

//added

// const mongoose = require('mongoose')


// // const password = 'hey88jude'

// const url = process.env.MONGODB_URI

// console.log('connecting to', url);

// mongoose.set('strictQuery',false);
// mongoose.connect(url)
// .then(result => {
//   console.log('connected to MongoDB')
// })
// .catch((error) => {
//   console.log('error connecting to MongoDB:', error.message)
// })

// const noteSchema = new mongoose.Schema({
//   name: String,
//   number: Number,
// })

// noteSchema.set('toJSON', {
//   transform: (document, returnedObject) => {
//     returnedObject.id = returnedObject._id.toString()
//     delete returnedObject._id
//     delete returnedObject.__v
//   }
// })

// const Note = mongoose.model('Note', noteSchema);

//above

// mongoose.connect(url).then(
  
//   Note.find({}).then(result => {
//   result.forEach(note => {
//     console.log(note.name, note.number)
//   })
//   mongoose.connection.close()
// })

// )



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
  response.send('<h1>Hello There!</h1>')
})

// app.get('/api/persons', (request, response) => {
//   response.json(persons)
// })

//added

app.get('/api/persons', (request, response) => {
  Note.find({}).then(notes => {
    response.json(notes)
  })
})

//above

app.get('/info', (request, response) => {
  // let peopleLength = persons.length;
  // console.log('length', peopleLength);
  Note.find({}).then(notes => {
    let peopleLength = (notes).length;
 
  response.send(`<p>There are ${peopleLength} people in phonebook</p><p>${new Date()}</p>` );
})
})

// app.get('/api/persons/:id', (request, response) => {
//   const id = Number(request.params.id);
//   const person = persons.find(person => person.id === id)
//   if (person) {
//   response.json(person);
//   } else {
//     response.status(404).end();
//   }
// })

app.get('/api/persons/:id', (request, response) => {
  Note.findById(request.params.id)
    .then(note => {
      if (note) {
        response.json(note)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
      // console.log(error)
      // // response.status(500).end()
      // response.status(400).send({ error: 'malformatted id' })

      
    // )
})


// app.delete('/api/persons/:id', (request, response) => {
//   const id = Number(request.params.id);
//   persons = persons.filter(person => person.id !== id);

//   response.status(204).end();
// })

app.delete('/api/persons/:id', (request, response, next) => {
  Note.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

// app.delete('/api/persons/:id', (request, response, next) => {
//   Note.findByIdAndRemove(request.params.id)
//     .then(result => {
//       response.status(204).end()
//     })
//     .catch(error => next(error))
// })




const generateId = () => {
  const personId = Math.ceil(Math.random() *1000000);
  return personId;
}

app.post('/api/persons', (request, response, next) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({ 
      error: 'content missing from user request' 
    })
  }

  if (persons.find(person => person.name.toLowerCase() === body.name.toLowerCase())){

    // console.log('TEST', persons.find(person => person.name.toLowerCase() === body.name.toLowerCase())[0])
    // if(persons.find(person => person.name.toLowerCase() === body.name.toLowerCase())[0]) {
    //   console.log('MADE IT');
    // } else {

    return response.status(400).json({
      error: 'person exists already in database'
    })
  }
  // }

  // const person = {
  const person = new Note({
    name: body.name,
    number: body.number,
    id: generateId(),
  })
  // }

  // persons = persons.concat(person);
  // response.json(person)

  person.save().then(savedNote => {
    response.json(savedNote)
  })
  .catch(error => next(error))

})

//ADDED 830

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body;
  
  // const body = request.body

  // const note = {
  //   name: body.name,
  //   number: body.number,
  // }

  //UPDATED BELOW
  Note.findByIdAndUpdate(request.params.id, {name, number}, { new: true, runValidators: true, context: 'query' })
    .then(updatedNote => {
      response.json(updatedNote)
    })
    .catch(error => next(error))
})

//ABOVE




const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } 

  next(error)
}

// this has to be the last loaded middleware.
app.use(errorHandler)




// const PORT = process.env.PORT || 3001
const PORT = process.env.PORT;
app.listen(PORT, (() => {
  console.log(`Server running on port ${PORT}`)
}))
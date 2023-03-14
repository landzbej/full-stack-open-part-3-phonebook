const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://landzbej:${password}@cluster0.maiyaa4.mongodb.net/noteApp?retryWrites=true&w=majority`

mongoose.set('strictQuery',false)
mongoose.connect(url)

const noteSchema = new mongoose.Schema({
  name: String,
  number: Number,
})

noteSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Note = mongoose.model('Note', noteSchema)




if (process.argv.length === 5) {
  let note = new Note({
    name: process.argv[3],
    number: process.argv[4]
  })

  note.save().then(result => {
    console.log(result.id)
    mongoose.connection.close()
  })
}


if (process.argv.length === 3) {
Note.find({}).then(result => {
  result.forEach(note => {
    console.log(note.name, note.number)
  })
  mongoose.connection.close()
})

// note.save().then(result => {
//   console.log('note saved!')
//   mongoose.connection.close()
// })
};
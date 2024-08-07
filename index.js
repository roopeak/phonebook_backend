require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())
app.use(requestLogger)

morgan.token('data', (request, response) => {
  if (request.method === 'POST') {
    return JSON.stringify(request.body)
  }

  return ' '
})


app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :data')
)

let persons = []

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/info', (request, response) => {
  response.send(`<p>Phonebook has info for ${persons.length} people</p><p>${new Date()}</p>`)
})

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id)
  .then(person => {
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
  })
  .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
  .then(result => {
    response.status(204).end()
  })
  .catch(error => next(error))
})

const generateId = () => {
  return Math.floor(Math.random() * 100)
}

app.post('/api/persons', (request, response) => {
  const body = request.body
  
  const person = new Person({
    id: generateId(),
    name: body.name,
    number: body.number
  })
  
  person
  .save()
  .then(savedPerson => {
    response.json(savedPerson)
  })
  .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.log(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT)
console.log(`Server running on port ${PORT}`)
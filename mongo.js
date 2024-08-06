const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

if (process.argv.length > 5) {
  console.log('add quotes to the name')
} else {
  const url =
  `mongodb+srv://roopeak:${password}@phonebook.8mcitkz.mongodb.net/phonebook?
  retryWrites=true&w=majority&appName=Phonebook`

  mongoose.set('strictQuery', false)
  mongoose.connect(url)
  
  const personSchema = new mongoose.Schema({
    name: String,
    number: String,
  })
  
  const Person = mongoose.model('Person', personSchema)
  
  const person = new Person({
    name: name,
    number: number
  })

  if (process.argv.length === 3) {
    console.log('phonebook:')
    Person.find({}).then(result => {
      result.forEach(persons => {
        console.log(`${persons.name} ${persons.number}`)
      })
      mongoose.connection.close()
    })
  } else {
    person.save().then(result => {
        console.log(`added ${name} number ${number} to phonebook`)
        mongoose.connection.close()
    })
  }
}
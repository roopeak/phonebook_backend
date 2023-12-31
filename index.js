require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/person");
const app = express();

app.use(express.static("dist"));
app.use(express.json());
// app.use(morgan("tiny"));
app.use(cors());

morgan.token("data", (req) => {
  if (req.method === "POST") {
    return JSON.stringify(req.body);
  }

  return " ";
});

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :data")
);

app.get("/api/persons", (req, res, next) => {
  Person.find({}).then(persons => {
    res.json(persons);
  })
    .catch(error => next(error));
});

app.get("/info", (req, res, next) => {
  Person.find({}).then(persons => {
    res.send(
      `<p>Phonebook has info for ${persons.length} people</p><p>${new Date()}</p>`
    );
  })
    .catch(error => next(error));
});

app.get("/api/persons/:id", (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person);
      } else {
        res.status(404).end();
      }
    })
    .catch(error => next(error));
});

app.delete("/api/persons/:id", (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then(() => {
      res.status(204).end();
    })
    .catch(error => next(error));
});

const generateId = () => {
  return Math.floor(Math.random() * 100);
};

app.post("/api/persons", (req, res, next) => {
  const body = req.body;

  const person = new Person({
    id: generateId(),
    name: body.name,
    number: body.number
  });

  if (body.name.length === 0 || body.number.length === 0) {
    return res.status(400).json({
      error: "name or number is blank"
    });
  }

  person.save().then(savedPerson => {
    res.json(savedPerson);
  })
    .catch(error => next(error));
});

app.put("/api/persons/:id", (req, res, next) => {
  const body = req.body;

  const person = {
    name: body.name,
    number: body.number
  };

  Person.findByIdAndUpdate(req.params.id, person, { new: true })
    .then((updatedPerson) => {
      res.json(updatedPerson);
    })
    .catch((error) => next(error));
});

const unknownEndpoint = (req, res) => {
  res.status(404).send({
    error: "unknown endpoint"
  });
};

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({
      error: error.message
    });
  }
  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

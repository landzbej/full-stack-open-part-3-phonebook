require("dotenv").config();

const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const Note = require("./models/note");

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
app.use(express.static("build"));
app.use(express.json());
morgan.token("toke", function (req, res) { return JSON.stringify(req.body); });
app.use(morgan(":method :url :status :res[content-length] - :response-time ms :toke"));

app.get("/", (request, response) => {
	response.send("<h1>Hello There!</h1>");
});

app.get("/api/persons", (request, response) => {
	Note.find({}).then(notes => {
		response.json(notes);
	});
});

app.get("/info", (request, response) => {
	Note.find({}).then(notes => {
		let peopleLength = (notes).length;
 
		response.send(`<p>There are ${peopleLength} people in phonebook</p><p>${new Date()}</p>` );
	});
});

app.get("/api/persons/:id", (request, response, next) => {
	Note.findById(request.params.id)
		.then(note => {
			if (note) {
				response.json(note);
			} else {
				response.status(404).end();
			}
		})
		.catch(error => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
	Note.findByIdAndRemove(request.params.id)
		.then(result => {
			response.status(204).end();
		})
		.catch(error => next(error));
});

const generateId = () => {
	const personId = Math.ceil(Math.random() *1000000);
	return personId;
};

app.post("/api/persons", (request, response, next) => {
	const body = request.body;

	if (!body.name || !body.number) {
		return response.status(400).json({ 
			error: "content missing from user request" 
		});
	}

	if (persons.find(person => person.name.toLowerCase() === body.name.toLowerCase())){
		return response.status(400).json({
			error: "person exists already in database"
		});
	}

	const person = new Note({
		name: body.name,
		number: body.number,
		id: generateId(),
	});

	person.save().then(savedNote => {
		response.json(savedNote);
	})
		.catch(error => next(error));
});

app.put("/api/persons/:id", (request, response, next) => {
	const { name, number } = request.body;
	Note.findByIdAndUpdate(request.params.id, {name, number}, { new: true, runValidators: true, context: "query" })
		.then(updatedNote => {
			response.json(updatedNote);
		})
		.catch(error => next(error));
});

const errorHandler = (error, request, response, next) => {
	console.error(error.message);

	if (error.name === "CastError") {
		return response.status(400).send({ error: "malformatted id" });
	} else if (error.name === "ValidationError") {
		return response.status(400).json({ error: error.message });
	} 

	next(error);
};

app.use(errorHandler);

const PORT = 3001;
app.listen(PORT, (() => {
	console.log(`Server running on port ${PORT}`);
}));
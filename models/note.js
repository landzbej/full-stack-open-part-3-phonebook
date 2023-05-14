const mongoose = require("mongoose");

mongoose.set("strictQuery",false);

const url = `mongodb+srv://landzbej:${password}@cluster0.maiyaa4.mongodb.net/noteApp?retryWrites=true&w=majority`;

console.log("connecting to", url);

mongoose.connect(url)
	.then(result => {
		console.log("connected to MongoDB");
	})
	.catch((error) => {
		console.log("error connecting to MongoDB:", error.message);
	});

const noteSchema = new mongoose.Schema({
	name: {
		type: String,
		minLength: 3,
		required: true
	},
	number: {
		type: String,
		validate: {
			validator: function(v) {
				return (/\d{2}-\d{6,}/.test(v) || /\d{3}-\d{5,}/.test(v)  );
			},
			message: props => `${props.value} is not a valid phone number!`
		},
		required: [true, "User phone number required"]
	},
});

noteSchema.set("toJSON", {
	transform: (document, returnedObject) => {
		returnedObject.id = returnedObject._id.toString();
		delete returnedObject._id;
		delete returnedObject.__v;
	}
});

module.exports = mongoose.model("Note", noteSchema);
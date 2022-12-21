import mongoose, { Schema } from 'mongoose';

// define how document data is structured
const txLogSchema = new Schema({
	user: { type: String, required: true },
	amount: { type: Number, required: true },
	txType: { type: String, required: true },
	time: { type: Date, required: true },
});

const loggedTxSchema = new Schema({
	txCollection: [txLogSchema],
});

// export model to interact with the collection
// assign model only if it's not asigned already
export default mongoose.models.BankTxData ||
	mongoose.model('BankTxData', loggedTxSchema);

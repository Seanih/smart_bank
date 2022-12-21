import bankDataModel from '../models/bankDataModel';
import mongoose from 'mongoose';
import dbConnect from '../lib/dbConnect';

// checks if ID is in the correct format before proceeding
const idFormatChecker = (id, res) => {
	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(404).json({ error: 'invalid ID format' });
	}
};

export const addTxCollection = async (req, res) => {
	const txCollection = req.body;
	console.log('txCollection: ', txCollection);

	// add doc to database
	try {
		console.log('trying to add collection...');
		await dbConnect();

		const newTxCollection = await bankDataModel.create({ txCollection });

		console.log('successfully added collection!');
		res.status(200).json(newTxCollection);
	} catch (error) {
		console.log(error.message);
		res.status(400).json({ error: error.message });
	}
};

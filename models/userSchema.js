import mongoose, { mongo, Schema } from 'mongoose';

// define how document data is structured
const userSchema = new Schema(
	{
		walletAddress: {
			type: String,
		},
	},
	{ timestamps: true }
);

// export model to interact with the collection
// assign model only if it's not asigned already
let Users = mongoose.models.users || mongoose.model('users', userSchema);

export default Users;

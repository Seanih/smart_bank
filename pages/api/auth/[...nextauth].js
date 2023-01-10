import NextAuth from 'next-auth';
import { MoralisNextAuthProvider } from '@moralisweb3/next';
import connectDB from '../../../lib/dbConnect';
import Users from '../../../models/userSchema';

export default NextAuth({
	providers: [MoralisNextAuthProvider()],
	// adding user info to the user session object
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.user = user;
			}
			return token;
		},
		async session({ session, token }) {
			session.user = token.user;

			// add wallet address to MongoDB
			try {
				await connectDB();
				const MongoUser = await Users.findOne({
					walletAddress: session.user.address,
				});

				if (!MongoUser) {
					const newUser = new Users({
						walletAddress: session.user.address,
					});

					await newUser.save();
				}
			} catch (error) {
			}

			return session;
		},
	},
});

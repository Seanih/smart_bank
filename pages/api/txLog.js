// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { addTxCollection } from '../../controllers/bankDataController';

export default function handler(req, res) {
	if (req.method == 'POST') {
		return addTxCollection(req, res);
	}
}

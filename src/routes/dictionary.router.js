import { Router } from 'express';
const dictionary = Router();

dictionary.param("word", async (req, res, next, word) => {
  req.word = word;
  next();
});

dictionary.get('/:word', async (req, res) => {
	return res.sendStatus(200).send(`You searched for GET method ${req.word}`);
});

dictionary.post('/:word', async (req, res) => {
	return res.sendStatus(200).send(`You searched for POST method ${req.word}`);
});

dictionary.get('*', async (req, res) => {
	return res.sendStatus(404).send('Cannot get the specified word');
});


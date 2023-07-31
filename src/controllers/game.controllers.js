import { db } from '../database/database.connection.js'

export async function getGames(req,res){
    try{
        const games = await db.query('SELECT * FROM games;');
        res.send(games.rows)
    }catch (err){
        res.status(500).send(err.message)
    }
}

export async function postGame(req,res){
    try{
        const name = await db.query('SELECT * FROM games WHERE name=$1', [req.body.name]);

        if (name.rows[0]) return res.status(409).send('Esse jogo ja está cadastrado');

        await db.query(
            'INSERT INTO games (name, image, "stockTotal", "pricePerDay" VALUES ($1, $2, $3, $4)',
            [req.body.name, req.body.image, req.body.stockTotal, req.body.pricePerDay]
        )

        res.sendStatus(201)
    }catch (err){
        res.status(500).send(err.message)
    }
}
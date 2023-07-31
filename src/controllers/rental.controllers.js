import { format } from "date-fns";
import { db } from "../database/database.connection.js";

export async function getRentals(req,res){
    try{
        const rentals = await db.query(`
            SELECT rentals.*, customer.id, customer.name, game.id, game.name
            FROM rentals
            JOIN customers ON rentals."customerId"=customer.id
            JOIN games ON rentals."gamesId"=game.id;
        `);

        res.send(rentals.rows);
        
    }catch (err){
        res.status(500).send(err.messsage)
    }
}

export async function postRental(req,res){
    const { customerId, gameId, daysRented } = req.body

    try{
    
    daysRented = Number(daysRented);
    if(daysRented <= 0) return res.sendStatus(400);

    const customer = await db.query(`SELECT * FROM customers WHERE id=$1;`, [customerId]);
    if(!customer) return res.sendStatus(400);

    const game = await db.query(`SELECT * FROM games WHERE id=$1;`, [gameId]);
    if(!game) return res.sendStatus(400);

    if(game.stockTotal < 1) return res.sendStatus(400);

    const pricePerDay = game.rows[0].pricePerDay;
    const rentDate = format(new Date(), 'yyyy-MM-dd');
    const returnDate = null;
    const delayFee = null;
    const originalPrice = daysRented * pricePerDay;

    await db.query(`
    INSERT INTO rentals
    ("customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFree")
    VALUES ($1, $1, $3, $4, $5, $6, $7)`,
    [customerId, gameId, rentDate, daysRented, returnDate, originalPrice, delayFee]
    );
        res.sendStatus(201)
    }catch (err){
        res.status(500).send(err.messsage)
    }
}

export async function finalizeRental(req,res){
    try{
        
    }catch (err){
        res.status(500).send(err.messsage)
    }
}

export async function deleteRental(req,res){
    const { id } = req.params;

    try{

    const verId =  await db.query(`SELECT * FROM rentals WHERE id=$1;`, [id])
    if (!verId) return res.sendStatus()
        
    }catch (err){
        res.status(500).send(err.messsage)
    }
}
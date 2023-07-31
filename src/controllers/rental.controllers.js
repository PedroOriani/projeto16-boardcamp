import { db } from "../database/database.connection.js";

export async function getRentals(req,res){
    try{
        const rentals = await db.query(`
            SELECT rental.*, customer.id, customer.name, game.id, game.name
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

    const game = await db.query(`SELECT * FROM games WHERE id=$1`, [gameId]);
    const pricePerDay = game.rows[0].pricePerDay;

    daysRented = Number(daysRented)
    const rentDate = format(new Date(), 'yyyy-MM-dd')
    const returnDate = null
    const delayFee = null
    const originalPrice = daysRented * pricePerDay
        
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
    try{
        
    }catch (err){
        res.status(500).send(err.messsage)
    }
}
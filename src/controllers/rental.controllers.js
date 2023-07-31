import { format } from "date-fns";
import { db } from "../database/database.connection.js";

export async function getRentals(req,res){
    try{
        const resultado = await db.query(`
            SELECT rentals.*, customer.id, customer.name, game.id, game.name
            FROM rentals
            JOIN customers ON rentals."customerId"=customer.id
            JOIN games ON rentals."gamesId"=game.id;
        `);

        const rentals = resultado.map(rent => {
            return{
                id: rent.id,
                customerId: rent.customerId,
                gameId: rent.gameId,
                daysRented: rent.daysRented,
                returnDate: rent.returnDate,
                originalPrice: rent.originalPrice,
                delayFee: rent.delayFee,
                customer:{
                    id: rent.customer.id,
                    name: rent.customer.name
                },
                game:{
                    id: rent.game.id,
                    name: rent.game.name
                }
            }
        })
        
        res.send(rentals)
    }catch (err){
        res.status(500).send(err.messsage)
    }
}

export async function postRental(req,res){
    const { customerId, gameId, daysRented } = req.body

    try{
    
    if(daysRented <= 0) return res.sendStatus(400);

    const customer = await db.query(`SELECT * FROM customers WHERE "id"=$1;`, [customerId]);
    if(customer.rows.length === 0) return res.sendStatus(400);

    const game = await db.query(`SELECT * FROM games WHERE "id"=$1;`, [gameId]);
    if(game.rows.length === 0) return res.sendStatus(400);

    if(game.rows[0].stockTotal < 1) return res.sendStatus(400);

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
        res.status(500).send(err.message)
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

    const rental =  await db.query(`SELECT * FROM rentals WHERE "id"=$1;`, [id]);

    if (rental.rows.length === 0) return res.status(404).send('Esse ID não corresponde a nenhum aluguel');

    if(rental.returnDate !== null) return res.sendStatus(400);

    await db.query (`DELETE FROM rentals WHERE "id"=$1;`, [id]);
        
    }catch (err){
        res.status(500).send(err.messsage)
    }
}
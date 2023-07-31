import { format } from "date-fns";
import { db } from "../database/database.connection.js";

export async function getRentals(req,res){
    try{
        const resultado = await db.query(`
            SELECT rentals.*, 
            customer.id AS customer_id, customer.name AS customer_name,
            game.id AS game_id, game.name AS game_name
            FROM rentals
            JOIN customers ON rentals."customerId"=customer.id
            JOIN games ON rentals."gamesId"=game.id;
        `);

        const rentals = resultado.rows.map((rent) => {
            return{
                id: rent.id,
                customerId: rent.customerId,
                gameId: rent.gameId,
                daysRented: rent.daysRented,
                returnDate: rent.returnDate,
                originalPrice: rent.originalPrice,
                delayFee: rent.delayFee,
                customer:{
                    id: rent.customer_id,
                    name: rent.customer_name
                },
                game:{
                    id: rent.game_id,
                    name: rent.game_name
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

    const gameAvailable = await db.query(`SELECT * FROM rentals WHERE "gameId"=$1;`, [gameId])
    if(game.rows[0].stockTotal <= gameAvailable.rows.length) return res.sendStatus(400);

    const pricePerDay = game.rows[0].pricePerDay;
    const rentDate = format(new Date(), 'yyyy-MM-dd');
    const originalPrice = daysRented * pricePerDay;

    await db.query(`
        INSERT INTO rentals
        ("customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFee")
        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [customerId, gameId, rentDate, daysRented, null, originalPrice, null]
    );
        res.sendStatus(201)
    }catch (err){
        res.status(500).send(err.message)
    }
}

export async function finalizeRental(req,res){
    const { id } = req.params;
    const returnDate = format(new Date(), 'yyyy-MM-dd')

    try{
        const rental = await db.query('SELECT * FROM rentals WHERE id=$1;', [id])

        if (rental.rows.length === 0) return res.sendStatus(404)
        if (rental.rows[0].returnDate != null) return res.sendStatus(400)

        const finalDay = format(addDays(rental.rentDate, rental.daysRented), 'yyyy-MM-dd')
        const perDay = rental.rentDate / rental.daysRented
        const fee = difDias(finalDay, returnDate) > 0 ? difDias(finalDay, returnDate) * perDay : 0;

    }catch (err){
        res.status(500).send(err.messsage)
    }
}

function difDias(d1, d2){
    const data1 = new Date(d1)
    const data2 = new Date(d2)

    const dif = data2 - data1
    const dias = dif / (1000 * 60 * 60 * 24);
    return dias 
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
import { format } from "date-fns";
import { db } from "../database/database.connection.js";

export async function getRentals(req,res){
    try{
        const resultado = await db.query(`
        SELECT 
        rentals.*,
        customers.id AS customer_id,
        customers.name AS customer_name,
        games.id AS game_id,
        games.name AS game_name
        FROM rentals
        JOIN customers ON rentals."customerId" = customers.id
        JOIN games ON rentals."gameId" = games.id
        ;`)

        const rentals = resultado.rows.map((r) => {
            return{
                id: r.id,
                customerId: r.customerId,
                gameId: r.gameId,
                daysRented: r.daysred,
                returnDate: r.returnDate,
                originalPrice: r.originalPrice,
                delayFee: r.delayFee,
                customer:{
                    id: r.customer_id,
                    name: r.customer_name
                },
                game:{
                    id: r.game_id,
                    name: r.game_name
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

        const returnDate = format(rental.rentDate, 'yyyy-MM-dd');

        const finalDay = format(addDays(rental.rentDate, rental.daysRented), 'yyyy-MM-dd')
        const perDay = rental.rentDate / rental.daysRented
        const fee = difDias(finalDay, returnDate) > 0 ? difDias(finalDay, returnDate) * perDay : 0;

        if (fee > 0){
            await db.query(`UPDATE rentals SET "returnDate" = $1, "delayFee" = $2 WHERE "id"=$3`, [returnDate, fee, id])
            return res.sendStatus(200)
        }else{
            await db.query(`UPDATE rentals SET "returnDate" = $1 WHERE "id"=$2`, [returnDate, id])
            return res.sendStatus(200)
        }

        

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

    if(rental.rows[0].returnDate === null) return res.sendStatus(400);

    await db.query (`DELETE FROM rentals WHERE "id"=$1;`, [id]);
        
    }catch (err){
        res.status(500).send(err.messsage)
    }
}
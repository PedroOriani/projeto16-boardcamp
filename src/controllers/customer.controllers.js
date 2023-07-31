import { db } from "../database/database.connection.js";
import { format } from "date-fns";


export async function getCustomers(req,res){
    try{
        const customers = await db.query("SELECT id, name, phone, cpf, to_char(birthday, 'YYYY-MM-DD') as birthday FROM customers;");

        res.send(customers.rows)

    }catch (err){
        res.status(500).send(err.message)
    }
}

export async function getCustomersById(req,res){
    const { id } = req.params

    try{
        const customer = await db.query(`SELECT id, name, phone, cpf, to_char(birthday, 'YYYY-MM-DD') as birthday FROM customers WHERE id=${id};`);

        if (customer.rows.length === 0) return res.status(404).send('Não existe um cliente com esse ID')
        
        res.send(customer.rows[0])

    }catch (err){
        res.status(500).send(err.message)
    }
}

export async function postCustomer(req,res){
    const { name, phone, cpf, birthday } = req.body;

    try{

        if((Number(cpf)) === NaN) return res.status(400).send('CPF deve apenas conter números');

        const verCpf = await db.query(`SELECT * FROM customers WHERE cpf ILIKE '%${cpf}%'`)
        if (verCpf.rows.length > 0) return res.status(409).send('Este número de CPF ja está sendo utilizado por outro usuário')

        await db.query(
            'INSERT INTO customers (name, phone, cpf, birthday) VALUES ($1, $2, $3, $4);',
            [name, phone, cpf, birthday]
        )

        res.sendStatus(201)
    }catch (err){
        res.status(500).send(err.message)
    }
}

export async function updateCustomer(req,res){
    const { name, phone, cpf, birthday } = req.body;
    const { id } = req.params

    try{
        const verCpf = await db.query(`SELECT * FROM customers WHERE cpf=${cpf} AND id<>${id};`)

        if (verCpf.rows.length > 0) return res.status(409).send('Este número de CPF ja está sendo utilizado por outro usuário');
    
        await db.query(`UPDATE customers SET "name"=${name}, phone=${phone}, cpf=${cpf}, birthday=${birthday} WHERE "id"=${id}`)

        res.sendStatus(200)
    }catch (err){
        res.status(500).send(err.message)
    }
}
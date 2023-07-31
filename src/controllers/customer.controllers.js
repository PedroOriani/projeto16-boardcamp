import { db } from "../database/database.connection.js";
import { format } from "date-fns";


export async function getCustomers(req,res){
    try{
        const customers = await db.query('SELECT * FROM customers');

        const customClient = customers.map(customer => customer.birthday = format(new Date(customer.birthday), 'yyyy-MM-dd'))

        res.send(customClient)
    }catch (err){
        res.status(500).send(err.message)
    }
}

export async function getCustomersById(req,res){
    const id = req.params

    try{
        const customer = await db.query(`SELECT * FROM customers WHERE id=${id}`);
        if (customer) {
            customer.birthday = format(new Date(customer.birthday), 'yyyy-MM-dd')
            res.send(customer)
        }else{
            return res.status(400).send('Não existe um cliente com esse ID')
        }        
    }catch (err){
        res.status(500).send(err.message)
    }
}

export async function postCustomer(req,res){
    const { cpf } = req.body;

    try{

        if(typeof(Number(cpf)) !== 'number') return res.status(400).send('CPF deve apenas conter números');
        
        const verCpf = await db.query(`SELECT * FROM customers WHERE cpf ILIKE '%${cpf}%'`)
        if (verCpf.rows.length > 0) return res.status(409).send('Este número de CPF ja está sendo utilizado')

        await db.query(
            'INSERT INTO customers (name, phone, cpf, birthday) VALUES ($1, $2, $3, $4);',
            [req.body.name, req.body.phone, req.body.cpf, req.body.birthday]
        )

        res.sendStatus(201)
    }catch (err){
        res.status(500).send(err.message)
    }
}

export async function updateCustomer(req,res){
    
}
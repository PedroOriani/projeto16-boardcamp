import { db } from "../database/database.connection.js";
import { format } from "date-fns";


export async function getCustomers(req,res){
    try{
        const customers = await db.query('SELECT * FROM customers');
        res.send(customers)
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
    
}

export async function updateCustomer(req,res){
    
}
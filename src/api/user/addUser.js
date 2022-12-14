import pool from '../../db/index.js';
import {promises} from 'fs';
import bcrypt from 'bcrypt';

const saltRounds = 10;

const addUser = async (name, email, password) => {
    let user = {};
    const client = await pool.connect();
    try {
        const hash = await bcrypt.hash(password, saltRounds);
        await client.query('BEGIN');
        const sql = await promises.readFile(
            './src/db/sql/user/addUser.sql',
            'utf-8'
        );
        const result = await client.query(sql, [name, email, new Date()]);
        user = result.rows[0];
        const sql2 = await promises.readFile(
            './src/db/sql/user/addLogin.sql',
            'utf-8'
        );
        await client.query(sql2, [email, hash]);
        await client.query('COMMIT');
    }
    catch (err) {
        await client.query('ROLLBACK');
        user = {};
    }
    finally {
        client.release();
    } 
    return user;
}

export default addUser;
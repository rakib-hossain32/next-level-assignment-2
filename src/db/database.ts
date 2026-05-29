import { Pool } from "pg";
import config from "../config/env";



export const pool = new Pool({
  connectionString: config.database_url,
});

export const initDB = async() => { 
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users(
            id SERIAL PRIMARY KEY,
            name VARCHAR(40)   NOT NULL,
            email VARCHAR(40) UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role VARCHAR(15) DEFAULT 'contributor',
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
            )
            `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS issues(
            id SERIAL PRIMARY KEY,
            title VARCHAR(150) NOT NULL,
            description TEXT CHECK (LENGTH(description)>=20),
            type VARCHAR(20) NOT NULL,
            status VARCHAR(20) DEFAULT 'open' CHECK(status IN ('open', 'in_progress', 'resolved')),
            reporter_id INT,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
            )
            `);
        console.log("Database connected successfully!")
        
     } catch (error) {
        console.log(error)
     }
 }
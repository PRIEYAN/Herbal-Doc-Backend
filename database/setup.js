const pool = require('./connect');

const createTableQuery = `
CREATE TABLE IF NOT EXISTS consumers (
    sno SERIAL,
    phonenumber VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    dob VARCHAR(10) NOT NULL
);
`;

async function setupDatabase() {
    try {
        await pool.query(createTableQuery);
        console.log(' Consumers table created successfully');
        
        // Test the table structure
        const result = await pool.query(`
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'consumers'
            ORDER BY ordinal_position;
        `);
        
        console.log('table structure:');
        result.rows.forEach(row => {
            console.log(`  - ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
        });
        
    } catch (error) {
        console.error('Error setting up database:', error.message);
    } finally {
        await pool.end();
    }
}

const createDoctorsTableQuery = `
CREATE TABLE IF NOT EXISTS doctors (
    sno SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phonenumber VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    nmr_number VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    hospital VARCHAR(150) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    aboutme TEXT NOT NULL,
    booked VARCHAR(100) DEFAULT 'none',
    bookedby VARCHAR(100) DEFAULT 'none'
);
`;

async function setupDoctorsTable() {
    try {
        await pool.query(createDoctorsTableQuery);
        console.log(' Doctors table created successfully');

        // Print table structure
        const result = await pool.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'doctors'
            ORDER BY ordinal_position;
        `);

        console.log('Doctors table structure:');
        result.rows.forEach(row => {
            console.log(`  - ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? '(NOT NULL)' : ''} ${row.column_default ? '(default: ' + row.column_default + ')' : ''}`);
        });

    } catch (error) {
        console.error('Error setting up Doctors table:', error.message);
    } finally {
        await pool.end();
    }
}

setupDoctorsTable();


setupDatabase(); 
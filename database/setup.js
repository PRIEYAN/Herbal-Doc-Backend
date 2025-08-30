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

setupDatabase(); 
const pool = require('./connect');

const dropAndCreateQuery = `
DROP TABLE IF EXISTS consumers;
CREATE TABLE consumers (
    sno SERIAL,
    phonenumber VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    dob VARCHAR(10) NOT NULL
);
`;

async function fixTable() {
    try {
        await pool.query(dropAndCreateQuery);
        console.log('✅ Consumers table recreated successfully');
        
        // Test the table structure
        const result = await pool.query(`
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'consumers'
            ORDER BY ordinal_position;
        `);
        
        console.log('📋 Table structure:');
        result.rows.forEach(row => {
            console.log(`  - ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
        });
        
    } catch (error) {
        console.error('❌ Error fixing table:', error.message);
    } finally {
        await pool.end();
    }
}

fixTable(); 
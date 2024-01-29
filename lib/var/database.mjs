import PG from 'pg';
const Pool = PG.Pool;

let pgClient ;

async function connectToDatabase(){
  pgClient = new Pool({
    user: process.env.USER,
    host: process.env.DB_HOST,
    database: process.env.DB,
    password: process.env.APIKEY,
    port: process.env.PORT
  });
  
  try{
    await pgClient.connect();
    console.log(`✅ PUZZLEGANG`);
  } catch(error){
    console.error('Error connecting to the database:', error);
  }
}

export {
  pgClient, connectToDatabase
};
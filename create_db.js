const mysql = require('mysql2/promise');

async function createDb() {
  try {
    // Essai de connexion avec l'ancien utilisateur pour voir s'il a les droits
    const connection = await mysql.createConnection({
      host: '167.86.108.246',
      port: 3906,
      user: 'root',
      password: 'root_password' // Mot de passe root par défaut du docker-compose
    });

    console.log('Connecté en tant que root. Création de la base de données et de l\'utilisateur...');

    await connection.query("CREATE DATABASE IF NOT EXISTS \`superecom_db\`;");
    await connection.query("CREATE USER IF NOT EXISTS 'superecom_user'@'%' IDENTIFIED BY 'superecom_pass';");
    await connection.query("GRANT ALL PRIVILEGES ON \`superecom_db\`.* TO 'superecom_user'@'%';");
    await connection.query("FLUSH PRIVILEGES;");

    console.log('Base de données et utilisateur créés avec succès !');
    await connection.end();
  } catch (error) {
    console.error('Erreur de connexion avec root:', error.message);
    
    try {
      console.log('Essai avec l\'utilisateur riwaya_user...');
      const conn2 = await mysql.createConnection({
        host: '167.86.108.246',
        port: 3906,
        user: 'riwaya_user',
        password: 'riwaya_pass'
      });
      
      await conn2.query("CREATE DATABASE IF NOT EXISTS \`superecom_db\`;");
      await conn2.query("CREATE USER IF NOT EXISTS 'superecom_user'@'%' IDENTIFIED BY 'superecom_pass';");
      await conn2.query("GRANT ALL PRIVILEGES ON \`superecom_db\`.* TO 'superecom_user'@'%';");
      await conn2.query("FLUSH PRIVILEGES;");
      
      console.log('Base de données et utilisateur créés avec riwaya_user !');
      await conn2.end();
    } catch (e2) {
      console.error('Erreur avec riwaya_user:', e2.message);
    }
  }
}

createDb();

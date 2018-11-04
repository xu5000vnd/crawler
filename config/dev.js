const MongoDBUser = process.env.MONGO_DB_USER || 'root';
const MongoDBPassword = process.env.MONGO_DB_PASS || 'singbui123';
module.exports = {
    mongoURI: `mongodb://${MongoDBUser}:${MongoDBPassword}@ds151523.mlab.com:51523/crawler`,
    crawlerURL: 'https://klook.klktech.com/activity/',
    crawlerURLLogin: 'https://klook.klktech.com/signin'
};

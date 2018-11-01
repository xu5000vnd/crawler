const MongoDBUser = process.env.MONGO_DB_USER;
const MongoDBPassword = process.env.MONGO_DB_PASS;
module.exports = {
    mongoURI: `mongodb+srv://${MongoDBUser}:${MongoDBPassword}@cluster0-ejsgu.mongodb.net/test?retryWrites=true`,
};

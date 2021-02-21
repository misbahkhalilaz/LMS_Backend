const dbConfig = {
    // please paste your db, host, user etc when you take pull, misbah fyi
    HOST: "localhost",
    USER: "postgres",
    PASSWORD: "123",
    DB: "testdb",
    dialect: "postgres",
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};
export default dbConfig;
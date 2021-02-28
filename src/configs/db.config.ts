const dbConfig = {
    // please paste your db, host, user etc when you take pull, misbah fyi
    HOST: "ec2-54-87-34-201.compute-1.amazonaws.com",
    USER: "xutnuxjkxyfpsy",
    PASSWORD: "d71a64def0bd1efae2bc11ed1f629f4f617ba5190eb36609e3ddadde2fb9ff87",
    DB: "d58341r7rgmro2",
    dialect: "postgres",
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};
export default dbConfig;
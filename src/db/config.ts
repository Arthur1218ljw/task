import AuctionObj from "../entity/auction";
 
export const mysqlLogin = {
    host: "127.0.0.1",
    port: 3306,
    username: "root",
    password: "root",
    database: "auction",
    entities: [AuctionObj],
    synchronise: true,
    logging: false
}
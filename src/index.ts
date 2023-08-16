import router from './routes';
import { DataSource } from 'typeorm';
import { mysqlLogin } from './db/config';
import Koa from 'koa';
import views from 'koa-views';
import statics from 'koa-static';
import schedule from 'node-schedule'
import AuctionService from './auction'
import AuctionObj from './entity/auction';
import { use } from 'chai';
import { getConnection } from "typeorm";

const app = new Koa();
const AppDataSource = new DataSource({
    ...mysqlLogin,
    type: 'mysql'
});
const s:number = 1;
AppDataSource.initialize().then(() => {
    schedule.scheduleJob('0 */3 * * * ?',async ()=>{
        console.log("deploy task");
        const auction = await AppDataSource.manager.findOneBy(AuctionObj,{status:'pending'});
        if(!auction)
            return;
        const txid = await AuctionService.deploy(auction);
        console.log(txid);
        await AppDataSource.manager.save(AuctionObj,{
            id: auction.id,
            status: 'online',
            txid: txid,
            amount: 1 
        })
    });
    schedule.scheduleJob('10 * * * * *',async ()=>{
        const time = new Date().getTime();
        console.log("finish task:");
        const auctions = await AppDataSource.getRepository(AuctionObj).createQueryBuilder("auction")
        .where("auction.status = :status and auction.deadline< :deadline", { status: 'online',deadline: time/1000 })
        .getMany();
         console.log(auctions);  

         await AppDataSource.getRepository(AuctionObj).createQueryBuilder()
         .update(AuctionObj)
         .set({ status: "finish"})
         .where("status = :status and deadline< :deadline", { status: 'online',deadline: time/1000 })
         .execute();
    });
    app.use(views(__dirname + '/views', {
        extension: 'ejs' // 使用 EJS 模板引擎
    }));
    app.use(statics(__dirname + '/public'));
    app.use(router.routes()).use(router.allowedMethods());
    app.listen(3005);
}).catch((err) => {
    console.error("Error during Data Source initialization", err)
});
export { AppDataSource }; 
import { Context } from "koa";
import {
  ScryptProvider,
  SensiletSigner,
  ContractCalledEvent,
  ByteString,
} from "scrypt-ts";
import { Scrypt } from 'scrypt-ts'
import { bsv, TestWallet, DefaultProvider, toByteString, FixedArray } from 'scrypt-ts'
import { findSig, MethodCallOptions, PubKey, toHex } from 'scrypt-ts'

import * as dotenv from 'dotenv'
import { Auction } from "./contracts/auction";
import AuctionObj  from "./entity/auction";
export default class AuctionService {

   public static async deploy(auctionObj: AuctionObj) {
    const deadline = Number(auctionObj.deadline);

    var artifact = require('../artifacts/auction.json');
    Auction.loadArtifact(artifact);
    dotenv.config()

    Scrypt.init({
      apiKey: 'testnet_e4bM1Hrz6bsfcQP6q4g8JcrmxJVzJMwTmkQx8gsFHhZtMG98',
      network: bsv.Networks.testnet
    })
    await Auction.compile()
    const privKey = 'cQmV7a8XWkEF31HWEHA8WUT6nbUYz5kowg5xeF2ABSbyxcVspgHN'

    const myPrivateKey = bsv.PrivateKey.fromWIF(privKey)
    const myPublicKey = bsv.PublicKey.fromPrivateKey(myPrivateKey)
    const myAddress = myPublicKey.toAddress()
    
    console.log("myPrivateKey:"+myPrivateKey)
    console.log("myPublicKey:"+myPublicKey)
    console.log("myAddress:"+myAddress)

    const privateKeyAuctioneer = myPrivateKey
    const publicKeyAuctioneer = myPublicKey

    const publicKeyNewBidder = myPublicKey
    const addressNewBidder = myAddress

    const auctionDeadline = Math.round(new Date(deadline).valueOf() / 1000)
    const auction = new Auction(
        PubKey(toHex(publicKeyAuctioneer)),
        BigInt(auctionDeadline)
    )
    auction.bindTxBuilder('bid', Auction.bidTxBuilder)

    const defaultSigner = new TestWallet(
      privateKeyAuctioneer,
      new DefaultProvider({
          network: bsv.Networks.testnet,
      })
    )

    await auction.connect(defaultSigner)

    const minBid = 1
    const deployTx = await auction.deploy(minBid)
    console.log('Auction contract deployed: ', deployTx.id)
    return deployTx.id;

    // const contract_id = {
    //     /** The deployment transaction id */
    //     txId: "440d569c2a7835d753a5a11a6f98a73542258c2427e18ec6d2b0d064e83d0ea2",
    //     /** The output index */
    //     outputIndex: 0,
    // };
    // try {
    //   const instance = await Scrypt.contractApi.getLatestInstance(
    //     Voting,
    //     contract_id
    //   );
    //   ctx.status = 200;
    //   ctx.body = instance.candidates[0].votesReceived.toString() ;
    // } catch (error: any) {
    //   console.error("fetchContract error: ", error);
    //   ctx.status = 200;
    //   ctx.body = "fetchContract error: " + error;
    // }
  }
}

import { Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity("fa_auction")
class AuctionObj {
    @PrimaryGeneratedColumn()
    id: string;
 
    @Column()
    txid: string;
 
    @Column()
    sn: string;

    @Column()
    status: string;

    @Column()
    deadline: string;

    @Column()
    amount: number;
}
export default AuctionObj;

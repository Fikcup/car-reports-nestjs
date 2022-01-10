import { 
    Entity, 
    Column, 
    PrimaryGeneratedColumn, 
    BeforeInsert, 
    BeforeUpdate,  
    Unique,
    OneToMany
} from 'typeorm';
import { Report } from '../reports/report.entity';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcrypt';

@Entity()
@Unique(['email'])
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    email: string;

    @Column()
    @Exclude()
    password: string;

    @Column({ default: true })
    admin: boolean;

    @OneToMany(() => Report, (report) => report.user)
    reports: Report[];

    @BeforeInsert()
    hashedPassword() {
        this.password = bcrypt.hashSync(this.password, 10);
    }

    @BeforeUpdate()
    hashUpdatedPassword() {
        if (this.password) {
            this.password = bcrypt.hashSync(this.password, 10);
        }
    }
}

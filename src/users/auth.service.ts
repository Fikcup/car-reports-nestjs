import { 
    BadRequestException, 
    NotFoundException, 
    Injectable
} from "@nestjs/common";
import { UserService } from "./user.service";
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UserService
    ) {}

    async signup(email: string, password: string) {
        const users = await this.usersService.find(email);
        if (users.length) {
            throw new BadRequestException('email in use');
        }

        const user = await this.usersService.create(email, password);
        return user;
    }

    async signin(email: string, password: string) {
        const [user] = await this.usersService.find(email);
        if (!user) {
            throw new NotFoundException('user not found');
        }

        const isCorrect = bcrypt.compareSync(password, user.password);
        if (!isCorrect) {
            throw new BadRequestException('bad password');
        }

        return user;
    }
}
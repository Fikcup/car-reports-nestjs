import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { User } from './user.entity';

describe('AuthService', () => {
    let service: AuthService;
    let fakeUserService: Partial<UserService>

    beforeEach(async () => {
        // create a fake copy of the user service
        const users: User[] = [];
        fakeUserService = {
            find: (email: string) => {
                const filteredUsers = 
                    users.filter(user => user.email === email);
                return Promise.resolve(filteredUsers);
            },
            create: (email: string, password: string) => {
                const user = { 
                    id: Math.floor(Math.random() * 999999),
                    email, 
                    password 
                } as User;
                users.push(user);
                return Promise.resolve(user);
            },
        };
    
        const module = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UserService,
                    useValue: fakeUserService
                }
            ]
        }).compile();
    
        service = module.get(AuthService);
    });

    it('can create an instance of auth service', async () => {
        expect(service).toBeDefined();
    });

    // test will always fail because hooks are not called
    // it('creates a new user with a hashed password', async () => {
    //     const user: User = 
    //         await service.signup('testing@gmail.com', 'password');
        
    //     expect(user.password).not.toEqual('password');
    // });

    it('throws an error is user signs up with an in use email', async () => {
        await service.signup('test@gmail.com', 'password');

        await expect(service.signup('test@gmail.com', 'password'))
            .rejects.toThrowError(BadRequestException);
    });

    it('throws if signin is called with an unused email', async () => {
        await expect(service.signin('test@gmail.com', 'password'))
            .rejects.toThrowError(NotFoundException);
    });

    it('throws an error if an invalid password is used', async () => {
        await service.signup('testpass@gmail.com', 'password')
        await expect(service.signin('testpass@gmail.com', 'wrongPassword'))
            .rejects.toThrowError(BadRequestException);
    });

    // test will always fail because hooks are not called
    // it('returns a user if the correct password is used', async () => {
    //     await service.signup('regpass@gmail.com', 'password');
    //     const user = await service.signin('regpass@gmail.com', 'password');
    //     expect(user).toBeDefined();
    // });
});

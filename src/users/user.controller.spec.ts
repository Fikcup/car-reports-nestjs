import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthService } from './auth.service';
import { User } from './user.entity';

describe('UserController', () => {
  let controller: UserController;
  let fakeUserService: Partial<UserService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    fakeUserService = {
      findOne: (id: number) => {
        return Promise.resolve(
          { 
            id, 
            email: 'test@gmail.com',
            password: 'password'
          } as User
        );
      },
      find: (email: string) => {
        return Promise.resolve([
          { 
            id: 1, 
            email: email,
            password: 'password'
          } as User
        ]);
      },
    };

    fakeAuthService = {
      signin: (email: string, password: string) => {
        return Promise.resolve({ id: 1, email, password } as User);
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: fakeUserService
        },
        {
          provide: AuthService,
          useValue: fakeAuthService
        }
      ]
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAllUsers returns a list of users with the given email', async () => {
    const users = await controller.findAllUsers('test@gmail.com');

    expect(users.length).toEqual(1);
    expect(users[0].email).toEqual('test@gmail.com');
  });

  it('findOneUser returns a single user with the given id', async () => {
    const user = await controller.findOneUser(1);
    expect(user).toBeDefined();
  });

  it('findOneUser throws an error if user with id is not found', async () => {
    fakeUserService.findOne = () => null;

    await expect(controller.findOneUser(5341))
      .rejects.toThrowError(NotFoundException);
  });

  it('singin updated session object and returns user', async () => {
    const session = { userId: 7 };
    const user = await controller.signin(
      { 
        email: 'rhys@gmail.com', 
        password: 'password' 
      },
      session
    );

    expect(user.id).toEqual(1);
    expect(session.userId).toEqual(1);
  });
});

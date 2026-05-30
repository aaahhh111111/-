export interface User {
    id: string;
    username: string;
    email: string;
    password: string;
    created_at: string;
}
export interface UserCreateInput {
    username: string;
    email: string;
    password: string;
}
export declare const UserModel: {
    create: (input: UserCreateInput) => User;
    findByEmail: (email: string) => User | undefined;
    findById: (id: string) => User | undefined;
    findByUsername: (username: string) => User | undefined;
    verifyPassword: (user: User, password: string) => boolean;
};
//# sourceMappingURL=User.d.ts.map
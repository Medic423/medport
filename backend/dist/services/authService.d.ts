export interface User {
    id: string;
    email: string;
    name: string;
    userType: 'ADMIN' | 'USER' | 'HEALTHCARE' | 'EMS';
    facilityName?: string;
    agencyName?: string;
    agencyId?: string;
    manageMultipleLocations?: boolean;
}
export interface LoginCredentials {
    email: string;
    password: string;
}
export interface AuthResult {
    success: boolean;
    user?: User;
    token?: string;
    error?: string;
}
export declare class AuthService {
    private jwtSecret;
    private emsPrisma;
    constructor();
    login(credentials: LoginCredentials): Promise<AuthResult>;
    verifyToken(token: string): Promise<User | null>;
    createUser(userData: {
        email: string;
        password: string;
        name: string;
        userType: 'ADMIN' | 'USER';
    }): Promise<User>;
    createAdminUser(userData: {
        email: string;
        password: string;
        name: string;
    }): Promise<User>;
    createRegularUser(userData: {
        email: string;
        password: string;
        name: string;
    }): Promise<User>;
}
export declare const authService: AuthService;
export default authService;
//# sourceMappingURL=authService.d.ts.map
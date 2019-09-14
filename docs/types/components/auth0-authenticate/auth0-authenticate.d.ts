export declare class Auth0Authenticate {
    clientId: string;
    domain: string;
    redirectUri: string;
    popup: boolean;
    private auth0;
    render(): void;
    componentWillLoad(): Promise<void>;
    login(): Promise<any>;
    logout(): Promise<any>;
    isAuthenticated(): Promise<any>;
    getUser(): Promise<any>;
    getApiAccessToken(audience: string, scopes: string): Promise<{
        accessToken: string;
    }>;
}

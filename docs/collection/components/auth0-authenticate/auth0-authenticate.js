import createAuth0Client from '@auth0/auth0-spa-js';
export class Auth0Authenticate {
    constructor() {
        this.redirectUri = location.origin;
    }
    render() { }
    async componentWillLoad() {
        console.debug('component loading');
        this.auth0 = await createAuth0Client({
            domain: this.domain,
            audience: `https://${this.domain}/userinfo`,
            client_id: this.clientId,
            redirect_uri: this.redirectUri
        });
        try {
            await this.auth0.handleRedirectCallback();
            console.log('authenticated');
        }
        catch (err) {
            console.debug(err);
        }
    }
    async login() {
        if (!navigator.onLine) {
            return;
        }
        let onlineCheck = `https://${this.domain}`;
        const timeout = new Promise((_resolve, reject) => {
            setTimeout(() => {
                reject(new Error('Auth0 unreachable'));
            }, 5000);
        });
        const head = fetch(onlineCheck, {
            method: "HEAD",
            mode: "no-cors",
            redirect: "follow",
            cache: 'no-cache',
            headers: {
                'ngsw-bypass': 'true'
            }
        });
        try {
            const winner = await Promise.race([timeout, head]);
            console.log(winner);
            console.log("Network ok, will try and authorise");
            try {
                await this.auth0.getTokenSilently();
            }
            catch (noSession) {
                await this.auth0.loginWithRedirect();
            }
        }
        catch (err) {
            console.warn("this.Auth0 unreachable: " + err);
        }
    }
    async logout() {
        // Remove tokens and expiry time from localStorage
        return this.auth0.logout({
            returnTo: `${location.protocol}://${location.host}:${location.port}`
        });
    }
    async isAuthenticated() {
        return this.auth0.isAuthenticated();
    }
    async getUser() {
        const user = await this.auth0.getUser();
        const idToken = await this.auth0.getIdTokenClaims();
        console.log(idToken);
        const profile = await fetch(`https://${this.domain}/api/v2/users/${user.sub}`, {
            headers: {
                authorization: `Bearer ${idToken.__raw}`
            }
        });
        return await profile.json();
    }
    async getApiAccessToken(audience, scopes) {
        try {
            const apiToken = await this.auth0.getTokenSilently({
                audience: audience,
                scope: scopes
            });
            return {
                accessToken: apiToken
            };
        }
        catch (err) {
            if (err.error === "consent_required") {
                this.auth0.loginWithRedirect({
                    audience: audience,
                    scope: scopes
                });
            }
        }
    }
    static get is() { return "auth0-authenticate"; }
    static get originalStyleUrls() { return {
        "$": ["auth0-authenticate.css"]
    }; }
    static get styleUrls() { return {
        "$": ["auth0-authenticate.css"]
    }; }
    static get properties() { return {
        "clientId": {
            "type": "string",
            "mutable": false,
            "complexType": {
                "original": "string",
                "resolved": "string",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": ""
            },
            "attribute": "client-id",
            "reflect": false
        },
        "domain": {
            "type": "string",
            "mutable": false,
            "complexType": {
                "original": "string",
                "resolved": "string",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": ""
            },
            "attribute": "domain",
            "reflect": false
        },
        "redirectUri": {
            "type": "string",
            "mutable": false,
            "complexType": {
                "original": "string",
                "resolved": "string",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": ""
            },
            "attribute": "redirect-uri",
            "reflect": false,
            "defaultValue": "location.origin"
        },
        "popup": {
            "type": "boolean",
            "mutable": false,
            "complexType": {
                "original": "boolean",
                "resolved": "boolean",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": ""
            },
            "attribute": "popup",
            "reflect": false
        }
    }; }
    static get methods() { return {
        "login": {
            "complexType": {
                "signature": "() => Promise<any>",
                "parameters": [],
                "references": {
                    "Promise": {
                        "location": "global"
                    }
                },
                "return": "Promise<any>"
            },
            "docs": {
                "text": "",
                "tags": []
            }
        },
        "logout": {
            "complexType": {
                "signature": "() => Promise<any>",
                "parameters": [],
                "references": {
                    "Promise": {
                        "location": "global"
                    }
                },
                "return": "Promise<any>"
            },
            "docs": {
                "text": "",
                "tags": []
            }
        },
        "isAuthenticated": {
            "complexType": {
                "signature": "() => Promise<any>",
                "parameters": [],
                "references": {
                    "Promise": {
                        "location": "global"
                    }
                },
                "return": "Promise<any>"
            },
            "docs": {
                "text": "",
                "tags": []
            }
        },
        "getUser": {
            "complexType": {
                "signature": "() => Promise<any>",
                "parameters": [],
                "references": {
                    "Promise": {
                        "location": "global"
                    }
                },
                "return": "Promise<any>"
            },
            "docs": {
                "text": "",
                "tags": []
            }
        },
        "getApiAccessToken": {
            "complexType": {
                "signature": "(audience: string, scopes: string) => Promise<{ accessToken: string; }>",
                "parameters": [{
                        "tags": [],
                        "text": ""
                    }, {
                        "tags": [],
                        "text": ""
                    }],
                "references": {
                    "Promise": {
                        "location": "global"
                    }
                },
                "return": "Promise<{ accessToken: string; }>"
            },
            "docs": {
                "text": "",
                "tags": []
            }
        }
    }; }
}

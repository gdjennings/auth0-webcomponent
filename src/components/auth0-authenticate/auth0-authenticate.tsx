import { Component, Prop, Method } from '@stencil/core';

import createAuth0Client from '@auth0/auth0-spa-js';

@Component({
	tag: 'auth0-authenticate',
	styleUrl: 'auth0-authenticate.css'
})
export class Auth0Authenticate {
	@Prop() clientId: string;
	@Prop() domain: string;
	@Prop() redirectUri: string = location.origin;
	@Prop() popup: boolean;

  private auth0;

  render() {}

	async componentWillLoad() {
    console.debug('component loading');
    this.auth0 = await createAuth0Client({
      domain: this.domain,
      audience: `https://${this.domain}/userinfo`,
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      useRefreshTokens: true,
      cacheLocation: 'localstorage',
    });

    if ((location.search || '').length > 0) {
      this.auth0.handleRedirectCallback().catch(err => {
        console.debug(err);
      });
    }
	}

	@Method()
	async login(): Promise<any> {
    if (!navigator.onLine) {
      return false;
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
      cache: 'no-store',
      headers: {
        'ngsw-bypass': 'true'
      }
    })

    try {
      const onlineResponse = await Promise.race([timeout, head]);
      console.log("Network ok, will try and authorise");
        try {
          await this.auth0.getTokenSilently();
          return true;
        } catch (noSession) {
          if (onlineResponse && ((onlineResponse as Response).status === 200 || (onlineResponse as Response).status === 0))  {
            await this.auth0.loginWithRedirect();
          }
          return false;
        }
    } catch (err) {
      console.warn("this.Auth0 unreachable: "+err);
      return false;
    }
	}

	@Method()
	async logout(): Promise<any> {
		// Remove tokens and expiry time from localStorage
    return this.auth0.logout({
      returnTo: `${location.protocol}//${location.host}`
    });
	}

	@Method()
	async isAuthenticated() {
		return this.auth0.isAuthenticated();
	}

	@Method()
	async getUser(): Promise<any> {
    const user = await this.auth0.getUser();
    if (user) {
      const idToken = await this.auth0.getIdTokenClaims();
      const profile = await fetch(`https://${this.domain}/api/v2/users/${user.sub}`, {
        headers: {
          authorization: `Bearer ${idToken.__raw}`
        }
      });
      return await profile.json();
    }
    return Promise.reject('Not authenticated');

	}

	@Method()
	async getApiAccessToken(audience:string, scopes:string): Promise<{accessToken: string}> {
    try {
			const apiToken = await this.auth0.getTokenSilently({
					audience: audience,
					scope: scopes
      });
      return {
        accessToken: apiToken
      };
    } catch (err) {
      if (err.error === "consent_required") {
        this.auth0.loginWithRedirect({
          audience: audience,
          scope: scopes
        });
      }
		}
	}

}

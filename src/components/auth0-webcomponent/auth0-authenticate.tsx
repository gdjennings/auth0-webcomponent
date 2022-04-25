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
      cacheLocation: 'localstorage',
      useRefreshTokens: true
    });

    await this.auth0.handleRedirectCallback().catch(err => console.debug(err));
	}

	@Method()
	async login(): Promise<boolean> {
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
      const winner = await Promise.race([timeout, head]);
      console.log(winner);
      console.log("Network ok, will try and authorise");
      try {
        await this.auth0.getTokenSilently();
        return true;
      } catch (noSession) {
        await this.auth0.loginWithRedirect();
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
      returnTo: `${location.origin}`
    });
	}

	@Method()
	async isAuthenticated() {
		return this.auth0.isAuthenticated();
	}

	@Method()
	async getUser(): Promise<any> {
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
      if (err.error === "consent_required" || err.error === 'login_required') {
        this.auth0.loginWithPopup({
          audience: audience,
          scope: scopes
        });
      }
		}
	}

}

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
      redirect_uri: this.redirectUri
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
    })

    try {
      await Promise.race([timeout, head]);
      console.log("Network ok, will try and authorise");
      try {
        await this.auth0.getTokenSilently();
      } catch (noSession) {
        await this.auth0.loginWithRedirect();
      }
    } catch (err) {
      console.warn("this.Auth0 unreachable: "+err);
    }
	}

	@Method()
	async logout(): Promise<any> {
		// Remove tokens and expiry time from localStorage
    return this.auth0.logout({
      returnTo: `${location.protocol}://${location.host}:${location.port}`
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
      if (err.error === "consent_required") {
        this.auth0.loginWithRedirect({
          audience: audience,
          scope: scopes
        });
      }
		}
	}

}

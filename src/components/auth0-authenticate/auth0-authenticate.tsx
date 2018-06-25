
import {throwError as observableThrowError, ReplaySubject,  Observable, of } from 'rxjs';
import {first} from 'rxjs/operators';

import { Component, Prop, Method, EventEmitter, Event } from '@stencil/core';
import 'whatwg-fetch';


// import * as Auth0 from 'auth0-js';
declare var auth0: any;

@Component({
	tag: 'auth0-authenticate',
	styleUrl: 'auth0-authenticate.css'
})
export class Auth0Authenticate {
	@Prop() clientId: string;
	@Prop() domain: string;
	@Prop() redirectUri: string = location.origin;
	@Prop() popup: boolean;

	@Event() authenticated: EventEmitter;
	@Event() loaded: EventEmitter;

	private webAuth: any;
	private access_token: string;
	private expires_at: number;
	private profile: string;
	private tokenRenewalTimeout: any;
	private authenticationStream: ReplaySubject<any> = new ReplaySubject();

	componentWillLoad() {
		this.webAuth = new auth0.WebAuth({
			domain: this.domain,
			clientID: this.clientId,
			responseType: 'token id_token',
			audience: `https://${this.domain}/userinfo`,
			scope: 'openid profile email',
			redirectUri: this.redirectUri
		});

		// this.access_token = localStorage.getItem("access_token");
		// this.expires_at = Number(localStorage.getItem("expires_at"));

		this.webAuth.parseHash((err, authResult) => {
			if (authResult) {
				this.onAuthResponse(err, authResult);
			}
		});
	}

	componentDidLoad() {
		this.loaded.emit();
	}

	@Method()
	login(params:any):Observable<any> {
		return Observable.create(observer => {
			let onlineCheck = `https://${this.domain}`;
			const timeout = new Promise((_resolve, reject) => {
				setTimeout(() => {
					reject(new Error('Auth0 unreachable'));
				}, 5000);
			});
			const head = fetch(onlineCheck, {
				method: "HEAD",
				mode: "no-cors",
				redirect: "follow"
			})

			Promise.race([timeout, head]).then(() => {
				console.log("Network ok, will try and authorise");
				this.webAuth.checkSession(params || {}, (err, authResult) => {
					this.onAuthResponse(err, authResult).subscribe(observer);
				});
			}).catch(err => {
				console.warn("Auth0 unreachable: "+err);
				observer.error(err);
			})
		});
	}

	@Method()
	logout() {
		// Remove tokens and expiry time from localStorage
		localStorage.removeItem('access_token');
		localStorage.removeItem('id_token');
		localStorage.removeItem('expires_at');
		if (this.tokenRenewalTimeout != null) {
			clearTimeout(this.tokenRenewalTimeout);
		}
	}

	@Method()
	isAuthenticated() {
		return this.access_token != null && new Date().getTime() < this.expires_at;
	}

	@Method()
	getUser(): Promise<any> {
		return new Promise((resolve,reject) => {
			this.authenticationStream.pipe(first()).subscribe({
				next: (tokenResponse) => {
					let auth0Manage = new auth0.Management({
						domain: this.domain,
						token: tokenResponse.idToken
					});

					auth0Manage.getUser(this.profile.sub, (err, result) => {
						if (err) {
							reject(err);
						} else {
							resolve(result);
						}
					});
				},
				error: (err) => {
					reject(err);
				}
			});
		});
	}


	@Method()
	getApiAccessToken(audience:string, scopes:string):Promise<any> {
		return new Promise((resolve, reject) => {
			if (!this.isAuthenticated()) {
				reject("Need to call login first");
			} else {
				this.webAuth.checkSession({
					audience: audience,
					scope: scopes
				}, (err, result) => {
					if (err) {
						if (err.error === "consent_required") {
							this.webAuth.authorize({
								audience: audience,
								scope: scopes
							})
						}
						console.error(err);
						reject(err);
					}
					resolve(result);
				});
			}
		})
	}

	
	private onAuthResponse(err, authResult):Observable<any> {
		if (authResult && authResult.accessToken && authResult.idToken) {
			window.location.hash = '';
			this.setSession(authResult);
			return of(authResult);
		} else if (err) {
			console.error(err);
			if (this.popup) {
				this.webAuth.popup.authorize({});
			} else {
				this.webAuth.authorize({state:(authResult || {}).state});
			}
			return observableThrowError(new Error("Redirecting for authentication"));
		}
	}

	private setSession(authResult) {
		// Set the time that the Access Token will expire at
		this.access_token = authResult.accessToken;
		this.expires_at = (authResult.expiresIn - 5/*seconds*/) * 1000 + new Date().getTime();

		// localStorage.setItem('access_token', authResult.accessToken);
		// localStorage.setItem('id_token', authResult.idToken);
		// localStorage.setItem('expires_at', JSON.stringify(this.expires_at));
		this.profile = authResult.idTokenPayload;

		this.authenticated.emit(true);
		this.authenticationStream.next(authResult);
		let delay = this.expires_at - Date.now();
		if (delay > 0) {
			this.tokenRenewalTimeout = setTimeout(() => this.login({state:authResult.state}), delay);
		}

	}

}

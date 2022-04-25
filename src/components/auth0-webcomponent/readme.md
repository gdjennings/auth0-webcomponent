# auth0-authenticate



<!-- Auto Generated Below -->


## Properties

| Property      | Attribute      | Description | Type      | Default           |
| ------------- | -------------- | ----------- | --------- | ----------------- |
| `clientId`    | `client-id`    |             | `string`  | `undefined`       |
| `domain`      | `domain`       |             | `string`  | `undefined`       |
| `popup`       | `popup`        |             | `boolean` | `undefined`       |
| `redirectUri` | `redirect-uri` |             | `string`  | `location.origin` |


## Methods

### `getApiAccessToken(audience: string, scopes: string) => Promise<{ accessToken: string; }>`



#### Returns

Type: `Promise<{ accessToken: string; }>`



### `getUser() => Promise<any>`



#### Returns

Type: `Promise<any>`



### `isAuthenticated() => Promise<any>`



#### Returns

Type: `Promise<any>`



### `login() => Promise<boolean>`



#### Returns

Type: `Promise<boolean>`



### `logout() => Promise<any>`



#### Returns

Type: `Promise<any>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*

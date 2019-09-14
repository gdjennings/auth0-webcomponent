# Auth0 Webcomponent

This is a stencil based component for a framework independent authentication and authorisation flow based on Auth0

It is still a crude implementation but is functional.

## Getting Started

To use this webcomponent, clone this repo to a new directory:

```bash
git clone https://github.com/gdjennings/auth0-webcomponent.git auth0-webcomponent
cd  auth0-webcomponent
git remote rm origin
```

and run:

```bash
npm install
npm run build
```

This will create a set of distribution files inside dist/

The simplest way to use this component is to copy the dist folder into a project and include the auth0-webcomponent.js script in you index.html

### index.html
```html
<!DOCTYPE html>
<html dir="ltr" lang="en">

  <head>
    <meta charset="utf-8">
    <title>Auth0 Webcomponent</title>
    <script src="/dist/auth0-webcomponent.js"></script>
  </head>

  <body>
    <auth0-authenticate id="auth0" client-id="<your_client_id>" domain="your_account.auth0.com"></auth0-authenticate>

    <script>
      let authElement = document.getElementById("auth0");

      authElement.login().then(() => {
        authElement.getUser().then(profile => {
          document.write(JSON.stringify(profile));
        })
        console.log(JSON.stringify(arguments));
        authElement.getApiAccessToken('an_api_audience', 'api:your_scope')
        .then((r) => {
          console.log("Woohoo");
          const token = r.accessToken
          fetch('url', {
            headers: {
              authorization: `Bearer ${token}`
            }
          })
        })
      });
    </script>
  </body>

</html>
```
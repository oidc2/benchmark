# Setup OpenID Provider

The following describes how to setup the OIDC² Benchmark software in an OpenID Provider.

## 1. Keycloak

### 1.1. Add Client

1. Login to the Admin Console of Keycloak, e.g., at [http://op.localhost/admin/](http://op.localhost/admin/).
2. Switch to your Realm, e.g. `ict`.
3. Go to *Manage > Clients > Client list* and click **Create client**.
4. Select **Client type** `OpenID Connect`, **Client ID** `ict-benchmark`, **Name** `ID Certification Token Benchmark` and click **Next**.
5. Set **Client authentication** `Off`, select only the `Standard flow` and click **Next**.
6. Set **Valid redirect URIs** to `http://localhost:4200/*`, **Web origins** to `http://localhost:4200`, and click **Save**.

### 1.2. Add Scope

1. Login to the Admin Console of Keycloak, e.g., at [http://op.localhost/admin/](http://op.localhost/admin/).
2. Switch to your Realm, e.g. `ict`.
3. Go to *Manage > Client scopes* and click **Create client scope**.
4. Set **Name** `e2e_auth_email` and click **Save**.

### 1.3. Set Client Scope

1. Login to the Admin Console of Keycloak, e.g., at [http://op.localhost/admin/](http://op.localhost/admin/).
2. Switch to your Realm, e.g. `ict`.
3. Go to *Manage > Clients > Client list* and select your client `ict-benchmark`.
4. Go to tab *Client scopes > Setup* and click **Add client scope**.
5. Check the `e2e_auth_email` scope and click **Add** as **Optional**.

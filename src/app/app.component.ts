import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { AuthConfig, OAuthService } from 'angular-oauth2-oidc';
import * as jose from 'jose';

const authCodeFlowConfig: AuthConfig = {
  issuer: 'http://op.localhost/realms/ict',
  redirectUri: window.location.origin + '/index.html',
  clientId: 'ict-benchmark',
  responseType: 'code',
  scope: 'profile e2e_auth_email',
  requireHttps: false,
};
const ictEndpoint: string = 'http://op.localhost/realms/ict/protocol/openid-connect/userinfo/ict';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
  get authenticated(): boolean {
    return this.oauthService.hasValidIdToken();
  }
  async login(): Promise<void> {
    this.oauthService.initCodeFlow();
  }
  logout(): void {
    this.oauthService.logOut();
  }

  readonly typeList: ('ES256' | 'ES384' | 'ES512' | 'RS256' | 'RS384' | 'RS512')[] = ['ES256', 'ES384', 'ES512', 'RS256', 'RS384', 'RS512'];
  nIdt: number = 0;
  nIct: number = 0;
  get idtRounds(): number {
    return Number(this.idTokenOptions.value.rounds);
  }
  get idtTime(): number {
    return Number(this.idTokenOptions.value.time);
  }
  get ictRounds(): number {
    return Number(this.idCertificationTokenOptions.value.rounds);
  }
  get ictTime(): number {
    return Number(this.idCertificationTokenOptions.value.time);
  }
  idtEvaluationStarted: boolean = false;
  ictEvaluationStarted: boolean = false;
  private _idtEvaluationFinished: boolean = true;
  get idtEvaluationFinished(): boolean {
    return this._idtEvaluationFinished;
  }
  set idtEvaluationFinished(value: boolean) {
    this._idtEvaluationFinished = value;
    if (value == true) {
      this.idTokenOptions.controls.rounds.enable();
      this.idTokenOptions.controls.time.enable();
    } else {
      this.idTokenOptions.controls.rounds.disable();
      this.idTokenOptions.controls.time.disable();
    }
  }
  private _ictEvaluationFinished: boolean = true;
  get ictEvaluationFinished(): boolean {
    return this._ictEvaluationFinished;
  }
  set ictEvaluationFinished(value: boolean) {
    this._ictEvaluationFinished = value;
    if (value == true) {
      this.idCertificationTokenOptions.controls.rounds.enable();
      this.idCertificationTokenOptions.controls.time.enable();
      this.idCertificationTokenOptions.controls.sigAlg.enable();
    } else {
      this.idCertificationTokenOptions.controls.rounds.disable();
      this.idCertificationTokenOptions.controls.time.disable();
      this.idCertificationTokenOptions.controls.sigAlg.disable();
    }
  }
  get ictSigAlg(): 'ES256' | 'ES384' | 'ES512' | 'RS256' | 'RS384' | 'RS512' {
    return this.idCertificationTokenOptions.value.sigAlg! as 'ES256' | 'ES384' | 'ES512' | 'RS256' | 'RS384' | 'RS512';
  }
  idtResults: number[] = [];
  ictResults: number[] = [];
  idTokenOptions = this.formBuilder.group({
    rounds: new FormControl({
      value: 20,
      disabled: !this.idtEvaluationFinished
    }, Validators.required),
    time: new FormControl({
      value: 5,
      disabled: !this.idtEvaluationFinished
    }, Validators.required),
  });
  idCertificationTokenOptions = this.formBuilder.group({
    rounds: new FormControl({
      value: 20,
      disabled: !this.ictEvaluationFinished
    }, Validators.required),
    time: new FormControl({
      value: 5,
      disabled: !this.ictEvaluationFinished
    }, Validators.required),
    sigAlg: new FormControl({
      value: 'SHA-256',
      disabled: !this.ictEvaluationFinished
    }, Validators.required),
  });

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly oauthService: OAuthService,
    private readonly httpService: HttpClient,
  ) {
    this.oauthService.configure(authCodeFlowConfig);
    this.oauthService.loadDiscoveryDocumentAndTryLogin().then(() => console.log('OIDC loaded'));
  }

  private getKey(type: 'ES256' | 'ES384' | 'ES512' | 'RS256' | 'RS384' | 'RS512', publicKey: JsonWebKey): jose.JWTHeaderParameters {
    switch (type) {
      case 'ES256':
        return { alg: 'ES256',  'type': 'JWT', 'jwk': { 'kty': 'EC', 'crv': 'P-256', 'x': publicKey.x, 'y': publicKey.y} };
      case 'ES384':
        return { alg: 'ES384',  'type': 'JWT', 'jwk': { 'kty': 'EC', 'crv': 'P-384', 'x': publicKey.x, 'y': publicKey.y} };
      case 'ES512':
        return { alg: 'ES512',  'type': 'JWT', 'jwk': { 'kty': 'EC', 'crv': 'P-512', 'x': publicKey.x, 'y': publicKey.y} };
      case 'RS256':
        return { alg: 'RS256',  'type': 'JWT', 'jwk': { 'kty': 'RSA', 'e': publicKey.e, 'n': publicKey.n} };
      case 'RS384':
        return { alg: 'RS384',  'type': 'JWT', 'jwk': { 'kty': 'RSA', 'e': publicKey.e, 'n': publicKey.n} };
      case 'RS512':
        return { alg: 'RS512',  'type': 'JWT', 'jwk': { 'kty': 'RSA', 'e': publicKey.e, 'n': publicKey.n} };
    }
  }
  private generateKey(type: 'ES256' | 'ES384' | 'ES512' | 'RS256' | 'RS384' | 'RS512'): Promise<CryptoKeyPair> {
    switch (type) {
      case 'ES256':
        return window.crypto.subtle.generateKey(
          {
            name: "ECDSA",
            namedCurve: "P-256",
          },
          false,
          ["sign", "verify"],
        );
      case 'ES384':
        return window.crypto.subtle.generateKey(
          {
            name: "ECDSA",
            namedCurve: "P-384",
          },
          false,
          ["sign", "verify"],
        );
      case 'ES512':
        return window.crypto.subtle.generateKey(
          {
            name: "ECDSA",
            namedCurve: "P-512",
          },
          false,
          ["sign", "verify"],
        );
      case 'RS256':
        return window.crypto.subtle.generateKey(
          {
            name: 'RSASSA-PKCS1-v1_5',
            modulusLength: 2048,
            publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
            hash: 'SHA-256'
          },
          false,
          ["sign", "verify"]
        );
      case 'RS384':
        return window.crypto.subtle.generateKey(
          {
            name: 'RSASSA-PKCS1-v1_5',
            modulusLength: 3072,
            publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
            hash: 'SHA-384'
          },
          false,
          ["sign", "verify"]
        );
      case 'RS512':
        return window.crypto.subtle.generateKey(
          {
            name: 'RSASSA-PKCS1-v1_5',
            modulusLength: 4096,
            publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
            hash: 'SHA-512'
          },
          false,
          ["sign", "verify"]
        );
    }
  }

  /**
   * generate a JWT used to request an OpenIdToken
   * @Params
   * "keyPair" is the key used by the avvount that wants to authenticate
   * "tokenClaims" are the claims present in the openId Token
   * "tokenNonce" is the nonce in the openId token
   * "tokenLifetime" is how long the token should be valid in seconds
   * @usedWith
   * generateTokenRequest ganerates a request token with can be used with the function: requestRemoteIdToken from this lib
   */
  private async generateTokenRequest(type: 'ES256' | 'ES384' | 'ES512' | 'RS256' | 'RS384' | 'RS512', keyPair: CryptoKeyPair, iss: string, sub: string, aud: string, iat: number, nbf: number, exp: number, nonce: number, tokenClaims: string[], tokenNonce: string, tokenLifetime: number): Promise<string> {
    let claimsString = ""
    for (let i = 0; i < tokenClaims.length; i++) {
      claimsString += tokenClaims[i]
      if (i != tokenClaims.length - 1) {
        claimsString += " "
      }
    }

    let publicKeyExp = await window.crypto.subtle.exportKey(
        "jwk",
        keyPair.publicKey,
    );

    const jwtBody =
    {
      "sub": sub,
      "nbf": nbf,
      "nonce": nonce,
      "token_claims": claimsString,
      "token_lifetime": tokenLifetime,
      "token_nonce": tokenNonce
    }

    const protectHeader = this.getKey(type, publicKeyExp);

    return await new jose.SignJWT(jwtBody)
      .setProtectedHeader(protectHeader)
      .setIssuedAt(iat)
      .setIssuer(iss)
      .setAudience(aud)
      .setExpirationTime(exp)
      .sign(keyPair.privateKey)
  }
  private async requestRemoteIdToken(accessToken: string, requestToken: string, ridtEndpointUri: string): Promise<string> {
    const header = new Headers();

    header.append('accept', 'application/json');
    header.append('Authorization',  'Bearer ' + accessToken)
    header.append('Content-Type', 'application/jwt')

    const message = {
      method: 'POST',
      headers: header,
      body: requestToken
    };

    const myRequest = new Request(ridtEndpointUri);

    var response = await fetch(myRequest, message)
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    var body = await response.text()

    return body
  }

  /**
   * Requests an ID Token.
   * @returns A promise which resolves when an ID Token was received.
   */
  private requestIdToken(): Promise<void> {
    const refreshToken = this.oauthService.getRefreshToken();
    const tokenEndpoint = this.oauthService.tokenEndpoint!;
    const parameters = new HttpParams()
      .set('grant_type', 'refresh_token')
      .set('refresh_token', refreshToken);
    const basicAuth = btoa(`${authCodeFlowConfig.clientId!}:`);
    const headers = new HttpHeaders().set('Authorization', 'Basic ' + basicAuth);

    return new Promise((resolve, reject) => {
      const subscription = this.httpService.post(tokenEndpoint, parameters, {
        headers: headers
      }).subscribe((value) => {
        if (value.hasOwnProperty('refresh_token')) {
          subscription.unsubscribe();
          resolve();
        } else {
          reject('No refresh token found!');
        }
      });
    });
  }
  /**
   * Requests an ID Certification Token.
   */
  private async requestIdCertificationToken(type: 'ES256' | 'ES384' | 'ES512' | 'RS256' | 'RS384' | 'RS512', keyPair: CryptoKeyPair): Promise<void> {
    const accessToken = this.oauthService.getAccessToken()!;
    const claims = this.oauthService.getIdentityClaims()!;
    const subjectClaim = claims['sub']!;
    const now = Math.floor(Date.now() / 1000);
    const exp = now + 10;
    const nonce = Math.round(Math.random() * 1000000);
    const tokenNonce = window.crypto.randomUUID();
    const tokenLifetime = 36000000;

    const irt = await this.generateTokenRequest(
      type,
      keyPair,
      authCodeFlowConfig.issuer!,
      subjectClaim,
      authCodeFlowConfig.issuer!,
      now,
      now,
      exp,
      nonce,
      ['name', 'given_name', 'family_name'],
      tokenNonce,
      tokenLifetime
    );
    const ict = await this.requestRemoteIdToken(accessToken, irt, ictEndpoint);
    if (!ict) {
      throw 'Received empty ICT';
    }
  }

  async startIdToken(): Promise<void> {
    console.log(`Starting ID Token benchmark with ${this.idtRounds} rounds and ${this.idtTime} seconds ...`);

    // Reset values.
    this.idtEvaluationStarted = true;
    this.idtEvaluationFinished = false;
    this.idtResults.length = 0;

    // Loop over rounds.
    for (this.nIdt = 0; this.nIdt < this.idtRounds; this.nIdt++) {
      console.log(`Starting ID Token benchmark round ${this.nIdt + 1} ...`);

      // Perform benchmark.
      const result = await new Promise<number>(async (resolve) => {
        let value: number = 0;
        let expired: boolean = false;

        // Set timeout which resolves when the time is expired.
        setTimeout(() => {
          expired = true;
          resolve(value);
        }, this.idtTime * 1000);

        // Loop over ID Token requests.
        while (!expired) {
          await this.requestIdToken();
          value++;
        }
      });

      console.log(`Result of ID Token benchmark round ${this.nIdt + 1} is ${result}`)

      // Add result of current benchmark.
      this.idtResults.push(result);
    }

    // Cleanup values.
    this.idtEvaluationFinished = true;

    console.log('ID Token benchmark finished');
  }
  async startIdCertificationToken(): Promise<void> {
    console.log(`Starting ID Certification Token benchmark with ${this.ictRounds} rounds and ${this.ictTime} seconds ...`);

    // Reset values.
    this.ictEvaluationStarted = true;
    this.ictEvaluationFinished = false;
    this.ictResults.length = 0;

    const type = this.ictSigAlg;

    console.log(`nict: ${this.nIct} | ictRounds: ${this.ictRounds} rounds: ${this.idCertificationTokenOptions.value.rounds}`);

    // Loop over rounds.
    for (this.nIct = 0; this.nIct < this.ictRounds; this.nIct++) {
      console.log(`Starting ID Certification Token benchmark round ${this.nIct + 1} ...`);

      // Perform benchmark.
      const result = await new Promise<number>(async (resolve) => {
        let value: number = 0;
        let expired: boolean = false;

        // Set timeout which resolves when the time is expired.
        setTimeout(() => {
          expired = true;
          resolve(value);
        }, this.ictTime * 1000);

        const keyPair = await this.generateKey(type);  

        // Loop over ID Token requests.
        while (!expired) {
          await this.requestIdCertificationToken(type, keyPair);
          value++;
        }
      });

      console.log(`Result of ID Certification Token benchmark round ${this.nIdt + 1} is ${result}`)

      // Add result of current benchmark.
      this.ictResults.push(result);
    }

    // Cleanup values.
    this.ictEvaluationFinished = true;

    console.log('ID Certification Token benchmark finished');
  }

  private downloadData(data: number[], fileName: string): void {
    let tsv = 'i\tn';
    for (let i = 0; i < data.length; i++) {
      tsv += `\n${i+1}\t${data[i]}`;
    }
    const tsvBlob = new Blob([tsv], { type: 'octet/stream' });
    const url = window.URL.createObjectURL(tsvBlob);
    const downloadElement = document.createElement('a');
    document.body.appendChild(downloadElement);
    downloadElement.href = url;
    downloadElement.style.display = 'none';
    downloadElement.download = fileName;
    downloadElement.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(downloadElement);
  }
  downloadIdtData(): void {
    this.downloadData(this.idtResults, 'idt.tsv');
  }
  downloadIctData(): void {
    this.downloadData(this.ictResults, `ict_${this.ictSigAlg.toLowerCase()}.tsv`);
  }
}

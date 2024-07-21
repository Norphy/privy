export class AuthResponseDto {
  constructor(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }
  //Access Token
  readonly accessToken: string;

  //Refresh Token
  readonly refreshToken: string;
}

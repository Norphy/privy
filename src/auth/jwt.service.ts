import { Injectable } from '@nestjs/common';
import { JwtPayload, decode, sign, verify } from 'jsonwebtoken';

@Injectable()
export class JwtService {
  constructor() {}

  /**
   * This method creates a JWT access token that expires in 1 hour.
   * @param {string} email - Email of the user we wish to create a JWT token for.
   */
  createAccessToken(email: string): string {
    const jwtSecret = process.env.JWT_ACCESS_TOKEN_SECRET;
    const token = sign({ email }, jwtSecret, {
      expiresIn: 3600, //Seconds
    });
    return token;
  }
  /**
   * This method creates a JWT refresh token that expires in 12 hours and is stored
   * with the user to refresh the access token.
   * @param {string} email - Email of the user we wish to create a JWT token for.
   */
  createRefreshToken(email: string): string {
    const jwtSecret = process.env.JWT_REFRESH_TOKEN_SECRET;
    const token = sign({ email }, jwtSecret, {
      expiresIn: 43200,
    });
    return token;
  }

  /**
   * This method verifies that the jwt token has not been tampered with.
   * @param {string} token - is the JWT token we wish to very.
   * throws TokenExpiredError, JsonWebTokenError
   */
  verifyAccessToken(token: string) {
    const jwtSecret = process.env.JWT_ACCESS_TOKEN_SECRET;
    //TODO: See if it returns payload even if token is invalid
    //TODO: See if it returns payload even if token is expired
    verify(token, jwtSecret, { complete: true });
  }

  /**
   * This method verifies that the jwt token has not been tampered with.
   * @param {string} token - is the JWT token we wish to very.
   * throws TokenExpiredError, JsonWebTokenError
   */
  verifyRefreshToken(token: string) {
    const jwtSecret = process.env.JWT_REFRESH_TOKEN_SECRET;
    verify(token, jwtSecret);
  }

  /**
   * This method decodes the JWT token and returns it
   * @param {string} token - is the JWT Token (Could be Access or Refresh Token)
   * @returns {string} - returns the email within the JWT payload
   */
  decodeToken(token: string): string {
    const jwtPayload: JwtPayload = decode(token, { json: true });
    return jwtPayload.email;
  }
}

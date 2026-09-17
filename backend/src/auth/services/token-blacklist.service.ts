import { Injectable } from '@nestjs/common';

@Injectable()
export class TokenBlacklistService {
  private readonly revokedTokens = new Map<string, number>();

  revoke(tokenId: string, expiresAt: number) {
    this.removeExpiredTokens();
    this.revokedTokens.set(tokenId, expiresAt * 1000);
  }

  isRevoked(tokenId: string) {
    this.removeExpiredTokens();
    return this.revokedTokens.has(tokenId);
  }

  private removeExpiredTokens() {
    const now = Date.now();
    for (const [tokenId, expiresAt] of this.revokedTokens) {
      if (expiresAt <= now) {
        this.revokedTokens.delete(tokenId);
      }
    }
  }
}

import { Injectable } from '@nestjs/common';
import * as midtransClient from 'midtrans-client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MidtransService {
  private readonly midtransSnap: midtransClient.Snap;

  constructor(private readonly configService: ConfigService) {
    this.midtransSnap = new midtransClient.Snap({
      isProduction: false, // Ganti dengan true untuk lingkungan produksi
      serverKey: this.configService.get<string>('MIDTRANS_SERVER_KEY'),
    });
  }

  // Metode untuk mendapatkan Snap transaction
  getSnapTransaction() {
    return this.midtransSnap;
  }
}

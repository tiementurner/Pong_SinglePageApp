import { Injectable } from '@nestjs/common';

@Injectable()
export class FileLockService {
  private locks: Map<string, Promise<void>> = new Map();

  async lock(filePath: string): Promise<() => void> {
    while (this.locks.has(filePath)) {
      await this.locks.get(filePath);
    }

    let resolve: () => void;
    const lockPromise = new Promise<void>(res => resolve = res);
    this.locks.set(filePath, lockPromise);

    return () => {
      this.locks.delete(filePath);
      resolve();
    };
  }
}

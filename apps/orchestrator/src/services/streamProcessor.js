import fs from 'fs';
import { pipeline } from 'stream/promises';
import { Transform } from 'stream';

export class StreamProcessor {
  constructor({ logger }) {
    this.logger = logger;
  }

  async processFileStream(inputPath, outputPath, transformFn) {
    const readStream = fs.createReadStream(inputPath, { highWaterMark: 64 * 1024 });
    const writeStream = fs.createWriteStream(outputPath);
    
    const transform = new Transform({
      transform(chunk, encoding, callback) {
        try {
          const result = transformFn ? transformFn(chunk) : chunk;
          callback(null, result);
        } catch (error) {
          callback(error);
        }
      }
    });

    try {
      await pipeline(readStream, transform, writeStream);
      this.logger.info('Stream processing completed', { inputPath, outputPath });
    } catch (error) {
      this.logger.error('Stream processing failed', { error: error.message });
      throw error;
    }
  }

  async copyFileStream(inputPath, outputPath) {
    const readStream = fs.createReadStream(inputPath, { highWaterMark: 64 * 1024 });
    const writeStream = fs.createWriteStream(outputPath);

    try {
      await pipeline(readStream, writeStream);
      this.logger.info('File copied via stream', { inputPath, outputPath });
    } catch (error) {
      this.logger.error('Stream copy failed', { error: error.message });
      throw error;
    }
  }

  createChunkedReader(filePath, chunkSize = 64 * 1024) {
    return fs.createReadStream(filePath, { highWaterMark: chunkSize });
  }
}

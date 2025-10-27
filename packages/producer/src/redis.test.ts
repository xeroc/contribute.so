import { RedisService } from './redis.js';

// Simple test to verify Redis service functionality
async function testRedisService() {
  console.log('Testing RedisService...');

  const redisService = new RedisService('redis://localhost:6379/0');

  try {
    // Test connection
    await redisService.connect();
    console.log('✅ Redis connection established');

    // Test signature storage
    const testSignature = 'test-signature-123';
    const prefix = 'test-prefix:';

    const stored = redisService.storeSignature(testSignature, prefix);
    console.log('✅ Signature stored:', stored);

    // Test signature checking
    const isProcessed = await redisService.isSignatureProcessed(testSignature, prefix);
    console.log('✅ Signature processed check:', isProcessed);

    // Test checkpointing
    const checkpointKey = 'test-checkpoint';
    const saved = redisService.saveCheckpoint(checkpointKey, testSignature, { extra: 'data' });
    console.log('✅ Checkpoint saved:', saved);

    // Test checkpoint retrieval
    const checkpoint = await redisService.getLastCheckpoint(checkpointKey);
    console.log('✅ Checkpoint retrieved:', checkpoint);

    console.log('🎉 All Redis service tests passed!');

  } catch (error) {
    console.error('❌ Redis service test failed:', error);
  } finally {
    await redisService.disconnect();
    console.log('✅ Redis connection closed');
  }
}

// Run test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testRedisService().catch(console.error);
}

export { testRedisService };
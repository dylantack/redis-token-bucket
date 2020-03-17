'use strict'

const crypto = require('crypto');
const redis = require('redis')

const redis_token_bucket = require('../index');
let consume;
let client;

beforeAll(() => {
    const options = {
      host: 'localhost',
    }
    client = redis.createClient(options)
    consume = redis_token_bucket.getConsumer(client);
});

afterAll(() => {
    client.quit();
});

describe('Consume tokens', () => {

    const key = crypto.randomBytes(16).toString('hex');
    const config = {
        refill_interval_ms: 200,
        max_bucket_size: 3
    }

    expect.extend({
        toBeNear (received, expected) {
            return {
                pass: Math.abs((expected - received) / expected) < 0.20,
                message: () => `expected ${received} to be near ${expected}`,
            }
        }
    });

    test('Tokens should succeed', async () => {
        let result = await consume(key, config);
        expect(result.tokensLeft).toBe(2)

        result = await consume(key, config);
        expect(result.tokensLeft).toBe(1);
        expect(result.timeLeftMs).toBe(0);
    });

    test('Last token count should be zero', async () => {
        let result = await consume(key, config);
        expect(result.tokensLeft).toBe(0);
        expect(result.timeLeftMs).toBeNear(config.refill_interval_ms);
    });

    test('failed token count should be negative', async () => {
        let result = await consume(key, config);
        expect(result.tokensLeft).toBe(-1);
        expect(result.timeLeftMs).toBeNear(config.refill_interval_ms);
    });

    test('Bucket should refill', async () => {
        await new Promise(r => {setTimeout(r, config.refill_interval_ms)});

        let result = await consume(key, config);
        expect(result.tokensLeft).toBe(0);
    });

    test('Bucket should not over-fill', async () => {
        await new Promise(r => {setTimeout(r, config.refill_interval_ms * (config.max_bucket_size + 1))});
        let result = await consume(key, config);
        expect(result.tokensLeft).toBe(2);
    });

    test('Setting token cost should succeed', async () => {
        config.cost = 2;
        let result = await consume(key, config);
        expect(result.tokensLeft).toBe(0);
    });
})

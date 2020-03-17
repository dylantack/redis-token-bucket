# Introduction

This module implements a token bucket, using Redis as a coordinator. This is primarily useful as a rate limiter.

Some features:
- Fast: about 7 million token operations per minute, tested on an i9-8950HK (much faster than
similar modules on NPM that use Redis Sorted Sets)
- Space-efficient: Redis only stores the token count, and last refill time
- No dependencies

# Example Usage

```js
const redis = require('redis');
const redis_token_bucket = require('redis-token-bucket');
const client = redis.createClient()    
const consume = redis_token_bucket.getConsumer(client);

consume('example_bucket_key', {
    refill_interval_ms: 1000,   // How often should new tokens be added to the bucket?
    max_bucket_size: 60,        // How big is the bucket?
    cost: 1                     // optional, if you want to consume more than 1 token
})
.then(result => {
    if (result.tokensLeft < 0) {
        console.log(`Error, wait ${result.timeLeftMs} milliseconds before retrying`);
    } else {
        console.log('Success');
    }
});
```


# License

The MIT License (MIT)

Copyright (c) 2020 Dylan Tack

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
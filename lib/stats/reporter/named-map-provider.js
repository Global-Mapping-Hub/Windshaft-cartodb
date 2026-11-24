'use strict';

const statKeyTemplate = ctx => `windshaft.named-map-provider-cache.${ctx.metric}`;

function instantiationCount (entry) {
    const value = providerValue(entry);
    if (!value || typeof value !== 'object') {
        return 0;
    }
    return Object.keys(value).length;
}

// lru-cache 11 dump() returns [key, { value }] pairs. Older dumps used { k, v }.
function providerValue (entry) {
    if (!entry) {
        return null;
    }
    if (Array.isArray(entry)) {
        const stored = entry[1];
        if (stored && typeof stored === 'object' && Object.prototype.hasOwnProperty.call(stored, 'value')) {
            return stored.value;
        }
        return stored;
    }
    if (Object.prototype.hasOwnProperty.call(entry, 'v')) {
        return entry.v;
    }
    if (Object.prototype.hasOwnProperty.call(entry, 'value')) {
        return entry.value;
    }
    return null;
}

module.exports = class NamedMapProviderReporter {
    constructor ({ namedMapProviderCache, intervalInMilliseconds } = {}) {
        this.namedMapProviderCache = namedMapProviderCache;
        this.intervalInMilliseconds = intervalInMilliseconds;
        this.intervalId = null;
    }

    start () {
        const { providerCache: cache } = this.namedMapProviderCache;
        const { statsClient: stats } = global;

        this.intervalId = setInterval(() => {
            try {
                const count = typeof cache.size === 'number' ? cache.size : (cache.length || 0);
                stats.gauge(statKeyTemplate({ metric: 'named-map.count' }), count);
                const entries = typeof cache.dump === 'function' ? (cache.dump() || []) : [];
                const namedMapInstantiations = entries.reduce((acc, entry) => {
                    return acc + instantiationCount(entry);
                }, 0);

                stats.gauge(
                    statKeyTemplate({ metric: 'named-map.instantiation.count' }),
                    namedMapInstantiations
                );
            } catch (error) {
                // A stats sample must not exit the tile process.
            }
        }, this.intervalInMilliseconds);
    }

    stop () {
        clearInterval(this.intervalId);
        this.intervalId = null;
    }
};

importScripts("/static/assets/js/vendor/workbox-sw.js");

workbox.routing.registerRoute(
    /\/vendor\/.*(?:css|js)$/,
    new workbox.strategies.CacheFirst({
        cacheName: "vendor",
        plugins: [
            new workbox.expiration.ExpirationPlugin({
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60
            }),
        ]
    })
);

workbox.routing.registerRoute(
    /\.*(?:css|js)$/,
    new workbox.strategies.StaleWhileRevalidate({
        cacheName: "assets",
        plugins: [
            new workbox.expiration.ExpirationPlugin({
                maxEntries: 20,
                maxAgeSeconds: 5 * 24 * 60 * 60
            }),
        ]
    })
);

workbox.routing.registerRoute(
    /\.(?:svg)$/,
    new workbox.strategies.CacheFirst({
        cacheName: "svg",
        plugins: [
            new workbox.expiration.ExpirationPlugin({
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60
            }),
        ]
    })
);

workbox.routing.registerRoute(
    /\/icon\//,
    new workbox.strategies.CacheFirst({
        cacheName: "icons",
        plugins: [
            new workbox.expiration.ExpirationPlugin({
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60
            }),
        ]
    })
);
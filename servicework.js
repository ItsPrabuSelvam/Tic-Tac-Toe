let SiteName = self.location.origin;

let cacheStart = "Tic-Tac-Toe--v";
let version = 1;
let OurOfflineCache = cacheStart + version;






self.addEventListener('install', async(e) => {
    /* console.log("Installing the Service Worker..."); */
    self.skipWaiting()

    const cacheNames = await caches.keys();
    const myCache = cacheNames.filter(cacheName => {
        return cacheName.startsWith(cacheStart);
    });


    await Promise.all(myCache.map(async (cacheToDelete) => {
        try {
            await caches.delete(cacheToDelete);
        }
        catch (err) {
            console.error(`Failed to delete ${cacheToDelete} from cache...`);
        }
    }));


})



self.addEventListener('activate', e => {
    /* console.log("Activating the Service Worker..."); */

    e.waitUntil(() => { self.clients.claim() });
});





self.addEventListener('fetch', e => {
    /* console.log(`Trying to fetch: ${e.request.url}`); */
    const fetchClone = e.request.clone();


    e.respondWith(
        caches.match(e.request).then(response => {
            if (response) {
                return response;
            } else {
                let response = fetch(fetchClone).then(res => {

                    /* console.log(`FetchClone == > ${fetchClone} and ResponseClone == > ${resClone}`) */

                    
                    if (e.request.url.startsWith(SiteName)) {
                        const resClone = res.clone();
                        caches.open(OurOfflineCache).then(cache => {
                            cache.put(fetchClone, resClone);
                        });
                    }


                    return res;
                });

                return response;
            }
        }).catch(error => {
            console.error('Error in fetch handler:', error);
           
            return new Response('Fallback response here', { status: 500 });
        })
    );
});

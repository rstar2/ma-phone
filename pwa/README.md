# PWA application

- This a Vite project with the addition of the `vite-plugin-pwa` plugin.
And some customization of the server-worker/workbox code. Custom Push notifications,
auto-update on new version and etc.. 

- Unfortunately the whole PWA solution is not "perfect" as the GEOLocation API is not present in service-worker code,  so the PWA has to be opened in the device in order to access the tab's/client's GEOLocation
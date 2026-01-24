// let prompt = null;

// window.addEventListener('beforeinstallprompt', (event) => {
//     console.log("BEFORE INSTALL", event);
//     event.preventDefault()
//     prompt = event;
// })

// window.addEventListener('click', (event) => {
//     if (prompt) {
//         prompt.prompt();
//         prompt.userChoice.then((result) => {
//             console.log("RESULT", result);
//         });
//     }
// });

// window.addEventListener('appinstalled', (event) => {
//     console.log("AFTER INSTALL", event);
// })

// if ('serviceWorker' in navigator) {
//     window.addEventListener('load', async () => {
//         // @ts-ignore
//         const registration = await navigator.serviceWorker.register(window.SWURL, { scope: '/' });
//         console.log("REGISTRATION", registration);
//     });
// }
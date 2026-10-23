THOMDUCK — GITHUB PAGES PACKAGE

DEPLOY
1. Extract this folder and upload its CONTENTS (not the outer folder) to the root of a GitHub repository.
2. In GitHub: Settings > Pages > Build and deployment > Deploy from a branch > main > /(root) > Save.
3. Wait for the Pages URL. This package uses relative local asset/page/manifest/service-worker paths so it can work from a project-repository subpath.
4. Test the homepage, images, internal links, browser console, and PWA installation over HTTPS.

IMPORTANT LIMITATION
GitHub Pages serves static files only. This package deliberately does not include .env, server.js, package.json, or credentials in the public static root. Account registration/authentication, admin actions, balances, deposit approval, rewards, gift-code redemption, and JSONBin reads/writes require a separately hosted secure backend. The front-end's /api calls will not work on GitHub Pages alone. Do not put JSONBin secrets or admin passwords in app.js or any public repository file.

PWA
manifest.json and sw.js use relative project paths for GitHub Pages. Service workers require HTTPS (GitHub Pages provides HTTPS). On iPhone/iPad use Safari > Share > Add to Home Screen.

SECURITY
The previous .env file was intentionally excluded because it contains sensitive credentials. If those values were exposed in a public repository or chat, rotate them. Set credentials only as environment variables on the backend host.

ADMIN
The requested administrator username/password must be configured on the secure backend, not in static HTML/JavaScript. Static-only GitHub Pages cannot securely enforce an admin login.

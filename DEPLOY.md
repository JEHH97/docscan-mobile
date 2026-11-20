# Running and sharing DocScan Mobile

## Expo Go

Install dependencies and run `npx expo start`, then scan the QR code with Expo Go. The default sample mode needs no API service and simulates a complete scan. Web preview is available with `npx expo start --web` or a static web export with `npx expo export --platform web`.

## Connect a local scan service

Start the service on your computer, then open Settings in the app. Enter the computer’s LAN IP and service port (not `localhost`) as the API base URL. Make sure both devices share a network and your firewall permits the port. Enter the optional service API key only if enabled on your service, turn sample mode off, then capture or select an image.

## Optional builds and updates

This project includes an EAS configuration but does not build, publish, or deploy automatically. To use EAS Update or make an Android preview APK, sign in with your own Expo account, configure a project ID for that account, then use Expo’s current EAS Update or `eas build --profile preview --platform android` workflow. Review app identifiers and privacy permissions before distributing a build.

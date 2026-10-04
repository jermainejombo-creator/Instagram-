# Lumina (mock photo-sharing app)

An Expo / React Native demo with a feed, stories, double-tap to like, comments, save, search grid and a profile screen. All data is local sample data; photos come from picsum.photos (needs internet on the phone).

## New in this version
- **Edit profile**: on the Profile tab tap *Edit profile* and type in the Username field. The username at the top of the profile (and on your comments) updates as you type.
- **Reels + insights**: the profile grid shows reels. Tap one, then *View insights*. Double-tap the *Reel insights* title to turn on edit mode, where you can change every number, the caption and date, the reel image (gallery, random, or pasted URL), the followers split, and the 7-day graph (bar values and labels). Tap *Done* to leave edit mode.

## Try it instantly (no build)
1. `npm install`
2. `npx expo install --fix`   (aligns package versions with your Expo version)
3. `npx expo start`
4. Scan the QR code with the Expo Go app on your Android phone.

## Build the APK (cloud build, no Android Studio needed)
1. `npm install -g eas-cli`
2. `eas login`   (free account at expo.dev)
3. `eas build:configure`   (if asked)
4. `eas build -p android --profile preview`
5. When it finishes, EAS prints a download link for the `.apk`. Open it on your phone and install (allow "install unknown apps" if prompted).

Before building, change `android.package` in `app.json` to your own unique id, e.g. `com.yourname.lumina`.

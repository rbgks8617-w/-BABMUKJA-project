# Mobile UI refresh

## Design and ownership

- `src/theme` owns the blue, neutral, green and coral palette and system text font.
- `src/components/AppUI.tsx` owns icons, icon buttons, section headings and bottom navigation.
- The original school, heart, lunchbox and map images are preserved. GabiaSolmee is used for the brand only.
- Home prioritizes cafeteria information, menu discovery and campus restaurants. Favorites keep their own empty state.
- Menu actions remain visible outside the scroll area. Map restaurant lists scroll independently of the map.
- Reviews use a bounded composer; failed submissions restore the draft. Meal-mate creation is expandable.
- Crowd values are explicitly labeled as examples, not live measurements.

## Verification (2026-09-16)

- `npm.cmd run typecheck`
- `npm.cmd run build:web`
- `npx.cmd expo export -p all --output-dir <temporary-directory> --max-workers 2`
- Browser layouts inspected at 320x700, 390x844 and 1280x800.
- Tested guest entry, search-to-menu navigation, favorite add/remove/empty state, menu options and cart totals.
- Tested map building tabs and map touch areas, scrolling to the last restaurant, review rating steps, composer dismissal, meal-mate form toggle and mark-all-read.
- Tested `dist-web/index.html` served from a nested directory, including original image loading and icon/brand fonts.

## Release follow-up

- Native bundle export is not a physical-device test or an APK/IPA build. Verify keyboards, safe areas, gestures and large text on real iOS/Android devices.
- The existing API tunnel is unavailable. Server-backed login, posting, moderation, notifications and chat have not been verified live in this pass.
- Existing remote food photos and local data include examples. Replace them with approved, menu-specific restaurant assets before release.
- Keep the original large map PNG; compress or convert to WebP after comparing image quality on devices.
- The current dependency audit reports 44 findings (including 15 high and 1 critical). Resolve with a separately tested Expo/dependency upgrade; no force upgrade was applied during UI work.
- `App.tsx` resolves production font URLs relative to the hosting directory. Preserve this when changing Expo versions or static hosting.

const participantStorageKey = "babmukja-participant-key";

let fallbackParticipantKey = "";

function createParticipantKey() {
  return `participant-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getParticipantKey() {
  if (fallbackParticipantKey) {
    return fallbackParticipantKey;
  }

  if (typeof globalThis.localStorage !== "undefined") {
    const storedKey = globalThis.localStorage.getItem(participantStorageKey);

    if (storedKey) {
      fallbackParticipantKey = storedKey;
      return storedKey;
    }

    const nextKey = createParticipantKey();
    globalThis.localStorage.setItem(participantStorageKey, nextKey);
    fallbackParticipantKey = nextKey;
    return nextKey;
  }

  fallbackParticipantKey = createParticipantKey();
  return fallbackParticipantKey;
}

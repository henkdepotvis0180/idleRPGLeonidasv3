import { useEffect, useRef, useState } from "react";
import { setAudioModeAsync, useAudioPlayer } from "expo-audio";
import { type State } from "../engine";
export function useGameAudio(state: State, enabled: boolean) {
  const music = useAudioPlayer(require("../../assets/audio/dawn-grove.wav"));
  const hit = useAudioPlayer(require("../../assets/audio/blade-hit.wav"));
  const spell = useAudioPlayer(require("../../assets/audio/spell-cast.wav"));
  const clear = useAudioPlayer(require("../../assets/audio/boss-clear.wav"));
  const previous = useRef(state.combat.event);
  const [error, setError] = useState("");
  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
    }).catch(() => setError("Audio is unavailable on this device."));
  }, []);
  useEffect(() => {
    music.loop = true;
    music.volume = 0.22;
    hit.volume = 0.25;
    spell.volume = 0.3;
    clear.volume = 0.3;
    if (enabled && state.settings.music) {
      try {
        music.play();
      } catch {
        setError("Tap Music to start audio.");
      }
    } else music.pause();
    if (!enabled) {
      hit.pause();
      spell.pause();
      clear.pause();
    }
  }, [enabled, state.settings.music, music, hit, spell, clear]);
  useEffect(() => {
    if (previous.current === state.combat.event) return;
    previous.current = state.combat.event;
    if (!enabled || !state.settings.effects) return;
    const player =
      state.combat.kind === "kill" && state.wave === 1
        ? clear
        : state.combat.effect !== "steel"
          ? spell
          : hit;
    player
      .seekTo(0)
      .then(() => player.play())
      .catch(() => setError("Sound effects could not play."));
  }, [enabled, state.combat.event, state.settings.effects]);
  return error;
}

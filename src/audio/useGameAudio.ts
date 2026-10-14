import { useEffect, useRef, useState } from "react";
import { setAudioModeAsync, useAudioPlayer } from "expo-audio";
import type { State } from "../engine";
import { soundProfile } from "./soundProfile";
export function useGameAudio(state: State, enabled: boolean) {
  const music = useAudioPlayer(require("../../assets/audio/dawn-grove.wav"));
  const winter = useAudioPlayer(require("../../assets/audio/still-sky.wav"));
  const players = {
    steel: useAudioPlayer(require("../../assets/audio/blade-hit.wav")),
    fire: useAudioPlayer(require("../../assets/audio/spell-fire.wav")),
    frost: useAudioPlayer(require("../../assets/audio/spell-frost.wav")),
    nature: useAudioPlayer(require("../../assets/audio/spell-nature.wav")),
    holy: useAudioPlayer(require("../../assets/audio/spell-holy.wav")),
    shadow: useAudioPlayer(require("../../assets/audio/spell-shadow.wav")),
    arcane: useAudioPlayer(require("../../assets/audio/spell-arcane.wav")),
    lightning: useAudioPlayer(
      require("../../assets/audio/spell-lightning.wav"),
    ),
    song: useAudioPlayer(require("../../assets/audio/spell-song.wav")),
    bow: useAudioPlayer(require("../../assets/audio/bow-shot.wav")),
    heavy: useAudioPlayer(require("../../assets/audio/heavy-impact.wav")),
    fists: useAudioPlayer(require("../../assets/audio/fist-impact.wav")),
    shield: useAudioPlayer(require("../../assets/audio/shield-impact.wav")),
    victory: useAudioPlayer(require("../../assets/audio/boss-clear.wav")),
  };
  const audible = useRef(enabled && state.settings.effects);
  audible.current = enabled && state.settings.effects;
  const previous = useRef(state.combat.event),
    [error, setError] = useState("");
  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
    }).catch(() => setError("Audio is unavailable on this device."));
  }, []);
  useEffect(() => {
    music.loop = winter.loop = true;
    music.volume = winter.volume = 0.18;
    try {
      const northern = state.zone >= 5;
      if (enabled && state.settings.music) {
        (northern ? music : winter).pause();
        (northern ? winter : music).play();
      } else {
        music.pause();
        winter.pause();
      }
      if (!enabled || !state.settings.effects)
        Object.values(players).forEach((p) => p.pause());
    } catch {
      setError("Tap Music to start audio.");
    }
  }, [enabled, state.settings.music, state.settings.effects, state.zone]);
  useEffect(() => {
    if (previous.current === state.combat.event) return;
    previous.current = state.combat.event;
    if (!enabled || !state.settings.effects || state.combat.kind === "none")
      return;
    const profile = soundProfile(state),
      player = players[profile.key];
    try {
      player.playbackRate = profile.rate;
      player.volume = profile.volume;
      player
        .seekTo(0)
        .then(() => {
          if (audible.current) player.play();
        })
        .catch(() => setError("Sound effects could not play."));
    } catch {
      setError("Sound effects could not play.");
    }
  }, [enabled, state.combat.event, state.settings.effects]);
  return error;
}

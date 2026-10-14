"""Generate original, deterministic PCM music and SFX. No samples or external compositions."""
import math, random, struct, wave
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]/'assets'/'audio'; ROOT.mkdir(parents=True,exist_ok=True)
RATE=22050

def write(name,seconds,fn):
    with wave.open(str(ROOT/name),'wb') as f:
        f.setnchannels(1); f.setsampwidth(2); f.setframerate(RATE)
        f.writeframes(b''.join(struct.pack('<h',int(max(-1,min(1,fn(i/RATE)))*26000)) for i in range(int(seconds*RATE))))

# Eight-bar original ambient phrase in a pentatonic palette. Gentle end fades permit looping.
notes=[261.63,329.63,392,440,392,329.63,293.66,261.63,220,261.63,329.63,392,329.63,293.66,261.63,220]
def music(t):
    length=32; step=int(t/2)%16; phase=t%2; n=notes[step]
    bell=(math.sin(2*math.pi*n*t)+.24*math.sin(2*math.pi*n*2*t))*math.exp(-phase*2.1)*.16
    bass=[130.81,110,146.83,98][int(t/8)]
    pad=sum(math.sin(2*math.pi*bass*r*t) for r in [1,1.5,2])*.025
    return (bell+pad)*min(1,t/1.5,(length-t)/1.5)
write('dawn-grove.wav',32,music)
rng=random.Random(403)
noise=[rng.uniform(-1,1) for _ in range(RATE)]
write('blade-hit.wav',.24,lambda t:(noise[int(t*RATE)]*.34+math.sin(2*math.pi*(125-100*t)*t)*.3)*math.exp(-t*22))
write('spell-cast.wav',.7,lambda t:(math.sin(2*math.pi*(390*t+240*t*t))+math.sin(2*math.pi*780*t)*.25)*math.exp(-t*5)*.23)
write('boss-clear.wav',1.2,lambda t:sum(math.sin(2*math.pi*f*t)*max(0,1-abs(t-i*.18)/.45) for i,f in enumerate([329.63,392,523.25,659.25]))*.16)

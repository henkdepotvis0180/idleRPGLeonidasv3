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

# Elemental vocabulary: every school has its own envelope, timbre and movement.
def noise_at(t, speed=1): return noise[int(t*RATE*speed)%len(noise)]
def fire(t):
    return (.38*noise_at(t)*(1+.5*math.sin(t*67))+.22*math.sin(2*math.pi*(72*t+45*t*t)))*math.exp(-t*5)*min(1,t*80)
def frost(t):
    return sum(math.sin(2*math.pi*f*t)*math.exp(-t*(6+i*2)) for i,f in enumerate([1174.66,1760,2349.32,3135]))*.14 + noise_at(t)*.07*math.exp(-t*16)
def nature(t):
    return (math.sin(2*math.pi*(450*t+90*math.sin(t*7)))*.12+math.sin(2*math.pi*260*t)*.07+noise_at(t,.7)*.1)*math.exp(-t*4)*min(1,t*25)
def holy(t):
    return sum(math.sin(2*math.pi*f*t)*math.exp(-t*(2.8+i*.5)) for i,f in enumerate([523.25,659.25,783.99,1046.5]))*.095*min(1,t*35)
def shadow(t):
    return (math.sin(2*math.pi*(175*t-42*t*t))*.22+math.sin(2*math.pi*53*t)*.12+noise_at(t,.35)*.09)*math.exp(-t*4)*min(1,t*30)
def arcane(t):
    return (math.sin(2*math.pi*(330*t+280*t*t)+math.sin(t*60)*2)*.2+math.sin(2*math.pi*990*t)*.08)*math.exp(-t*4)*min(1,t*45)
def lightning(t):
    return (noise_at(t)*.4*(.3+.7*max(0,math.sin(t*140)))+math.sin(2*math.pi*(90*t+1000*t*t))*.1)*math.exp(-t*10)
def song(t):
    return sum(math.sin(2*math.pi*f*t)*math.exp(-max(0,t-i*.065)*7)*int(t>=i*.065) for i,f in enumerate([392,493.88,587.33,783.99]))*.1
for name,fn in [('fire',fire),('frost',frost),('nature',nature),('holy',holy),('shadow',shadow),('arcane',arcane),('lightning',lightning),('song',song)]: write('spell-'+name+'.wav',.85,fn)
write('bow-shot.wav',.3,lambda t:(noise_at(t)*.18*math.exp(-t*20)+math.sin(2*math.pi*165*t)*.25*math.exp(-t*40)))
write('heavy-impact.wav',.36,lambda t:(math.sin(2*math.pi*(80*t-65*t*t))*.4+noise_at(t)*.2)*math.exp(-t*17))
write('shield-impact.wav',.5,lambda t:sum(math.sin(2*math.pi*f*t)*math.exp(-t*(8+i*2)) for i,f in enumerate([230,643,1310]))*.15)
write('fist-impact.wav',.22,lambda t:(math.sin(2*math.pi*105*t)*.4+noise_at(t)*.12)*math.exp(-t*27))
# Northern ambient cue: an original slow minor-pentatonic phrase with a low, wind-like pad.
def winter(t):
    phrase=[220,261.63,293.66,329.63,293.66,261.63,196,220,164.81,196,220,261.63,220,196,164.81,146.83]
    note=phrase[int(t/2)%16]; phase=t%2
    bell=(math.sin(2*math.pi*note*t)+math.sin(2*math.pi*note*3*t)*.15)*math.exp(-phase*1.8)*.12
    pad=sum(math.sin(2*math.pi*f*t) for f in [55,82.41,110])*.025
    return (bell+pad)*min(1,t/2,(32-t)/2)
write('still-sky.wav',32,winter)

"""Smoke-test the installed release APK through Android accessibility and logcat."""
import re, subprocess, time, xml.etree.ElementTree as ET
from pathlib import Path
OUT=Path('artifacts/android-smoke'); OUT.mkdir(parents=True,exist_ok=True)
APP='com.leonidas.idlerpgv3'
def adb(*args,check=True):
 return subprocess.run(['adb',*args],check=check,stdout=subprocess.PIPE,stderr=subprocess.PIPE).stdout

def hierarchy():
 for _ in range(3):
  output=adb('shell','am','instrument','-w','com.leonidas.smoketools/.DumpInstrumentation',check=False)
  start=output.find(b'<?xml');end=output.find(b'</hierarchy>')
  raw=output[start:end+len(b'</hierarchy>')] if start>=0 and end>=0 else b''
  (OUT/'last-window.xml').write_bytes(raw)
  assert b'3D graphics could not start' not in raw, 'Native 3D renderer failed'
  try:return ET.fromstring(raw)
  except ET.ParseError:time.sleep(.3)
 raise AssertionError('Android UI hierarchy could not be read: '+output.decode(errors='replace'))

def tap(label,scroll=False):
 for _ in range(14 if scroll else 4):
  root=hierarchy()
  rest=next((n for n in root.iter('node') if n.get('content-desc')=='Sun Shard · +4 attack this run'),None)
  if rest is not None and label!='Sun Shard · +4 attack this run':
   x1,y1,x2,y2=map(int,re.findall(r'-?\d+',rest.get('bounds','')))
   adb('shell','input','swipe',str((x1+x2)//2),str((y1+y2)//2),str((x1+x2)//2),str((y1+y2)//2),'150');time.sleep(.5)
   continue
  for node in root.iter('node'):
   if node.get('content-desc')==label or node.get('text')==label:
    values=list(map(int,re.findall(r'-?\d+',node.get('bounds',''))))
    if len(values)==4:
     x1,y1,x2,y2=values
     if x2>x1 and y2>y1 and node.get('visible')=='true':
      print('TAP',label,node.get('bounds',''),flush=True)
      adb('shell','input','swipe',str((x1+x2)//2),str((y1+y2)//2),str((x1+x2)//2),str((y1+y2)//2),'150');time.sleep(.5);return
  # A fast spell kill may reach a rest point while accessibility is being queried.
  # Pick the same player blessing used in balance tests, then resume the requested control.
  if label=='Pause expedition':
   for node in root.iter('node'):
    if node.get('content-desc')=='Sun Shard · +4 attack this run':
     x1,y1,x2,y2=map(int,re.findall(r'-?\d+',node.get('bounds','')))
     adb('shell','input','swipe',str((x1+x2)//2),str((y1+y2)//2),str((x1+x2)//2),str((y1+y2)//2),'150');time.sleep(.3);break
  if scroll:adb('shell','input','swipe','540','1500','540','650','350')
  time.sleep(1)
 raise AssertionError('Android control not found: '+label)

def screenshot(name):
 data=adb('exec-out','screencap','-p');assert data.startswith(b'\x89PNG');(OUT/name).write_bytes(data)

adb('logcat','-c')
adb('shell','am','start','-W','-n',APP+'/.MainActivity')
try:
 time.sleep(8)
 assert adb('shell','pidof',APP).strip(), 'App process is not running'
 screenshot('01-class-selection.png')
 tap('Begin as Bastion',scroll=True)
 tap('Pause expedition')
 time.sleep(3)
 screenshot('02-battle.png')
 tap('Explore region')
 tap('Switch to third person')
 time.sleep(2)
 tap('Move east')
 tap('Move north')
 screenshot('03-third-person.png')
 for attempt in range(3):
  tap('Open world map')
  time.sleep(2)
  root=hierarchy()
  if any(n.get('content-desc')=='Close map' for n in root.iter('node')):break
  screenshot('map-not-open-'+str(attempt)+'.png')
 else:raise AssertionError('Map tap did not present the native atlas')
 screenshot('04-world-map.png')
 tap('Walk to Moonlit Cairn')
 time.sleep(4)
 tap('Open cache')
 tap('Switch to overview')
 time.sleep(2)
 screenshot('05-exploration-overview.png')
 tap('Return to combat')
 tap('Position left')
 tap('Stance Balanced')
 tap('Open Hero')
 screenshot('06-character.png')
 tap('Drakari',scroll=True)
 tap('Umbral Pact',scroll=True)
 tap('Skin tone 3',scroll=True)
 screenshot('07-customized-drakari.png')
 tap('Mage',scroll=True)
 tap('Open Adventure')
 tap('Resume expedition')
 tap('Ember Lance · Cast')
 tap('Frost Nova · Cast')
 screenshot('08-elemental-spells.png')
 tap('Pause expedition')
 tap('Open Settings')
 tap('Music off',scroll=True)
 time.sleep(2)
 tap('Music on')
 screenshot('09-settings.png')
 adb('shell','input','keyevent','3');time.sleep(1)
 adb('shell','am','start','-W','-n',APP+'/.MainActivity');time.sleep(2)
 tap('Open Adventure')
 screenshot('10-restored.png')
 assert adb('shell','pidof',APP).strip(), 'App crashed after 3D/audio interactions'
 logs=adb('logcat','-d').decode('utf-8',errors='replace');(OUT/'logcat.txt').write_text(logs)
 fatal=[line for line in logs.splitlines() if ('FATAL EXCEPTION' in line or ('ReactNativeJS' in line and re.search(r'\b(Error|TypeError|ReferenceError):',line)) or 'Error creating WebGL context' in line)]
 assert not fatal, '\n'.join(fatal[-20:])
 assert '3D graphics could not start' not in (OUT/'last-window.xml').read_text()
 print('PASS: installed Android APK, large native 3D battlefield, third person/camera swap, movement/map/cache, tactical positions, race/faction customization, two elemental spells, music toggles, no fatal native/JS logs')
finally:
 (OUT/'logcat.txt').write_bytes(adb('logcat','-d',check=False))
 try:hierarchy()
 except Exception:pass
 screenshot('final-screen.png')

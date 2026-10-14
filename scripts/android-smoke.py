"""Smoke-test the installed release APK through Android accessibility and logcat."""
import re, subprocess, time, xml.etree.ElementTree as ET
from pathlib import Path
OUT=Path('artifacts/android-smoke'); OUT.mkdir(parents=True,exist_ok=True)
APP='com.leonidas.idlerpgv3'
def adb(*args,check=True):
 return subprocess.run(['adb',*args],check=check,stdout=subprocess.PIPE,stderr=subprocess.PIPE).stdout

def hierarchy():
 for _ in range(3):
  result=adb('shell','uiautomator','dump','--compressed','/sdcard/leonidas-window.xml',check=False)
  raw=adb('shell','cat','/sdcard/leonidas-window.xml',check=False)
  assert b'3D graphics could not start' not in raw, 'Native 3D renderer failed'
  try:return ET.fromstring(raw)
  except ET.ParseError:time.sleep(1)
 raise AssertionError('Android UI hierarchy could not be read')

def tap(label,scroll=False):
 for _ in range(8 if scroll else 3):
  root=hierarchy()
  for node in root.iter('node'):
   if node.get('content-desc')==label or node.get('text')==label:
    values=list(map(int,re.findall(r'\d+',node.get('bounds',''))))
    if len(values)==4:
     x1,y1,x2,y2=values
     if x2>x1 and y2>y1:
      adb('shell','input','tap',str((x1+x2)//2),str((y1+y2)//2));time.sleep(1);return
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
 screenshot('02-battle.png')
 tap('Open Hero')
 screenshot('03-character.png')
 tap('Skin tone 3',scroll=True)
 screenshot('04-customized.png')
 tap('Open Settings')
 tap('Music off',scroll=True)
 time.sleep(2)
 tap('Music on')
 screenshot('05-settings.png')
 assert adb('shell','pidof',APP).strip(), 'App crashed after 3D/audio interactions'
 logs=adb('logcat','-d').decode('utf-8',errors='replace');(OUT/'logcat.txt').write_text(logs)
 fatal=[line for line in logs.splitlines() if ('FATAL EXCEPTION' in line or ('ReactNativeJS' in line and re.search(r'\b(Error|TypeError|ReferenceError):',line)) or 'Error creating WebGL context' in line)]
 assert not fatal, '\n'.join(fatal[-20:])
 assert '3D graphics could not start' not in adb('shell','uiautomator','dump','/dev/tty',check=False).decode(errors='replace')
 print('PASS: installed Android APK, native 3D class preview/battle/wardrobe, customization, audio toggles, no fatal native/JS logs')
finally:
 (OUT/'logcat.txt').write_bytes(adb('logcat','-d',check=False))

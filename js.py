import json
from collections import defaultdict
from selenium import webdriver
from time import sleep

def to_minutes(seconds: float) -> str:
	minutes = seconds//60
	return f'{"{:.0f}".format(minutes)}:{"{:.3f}".format(seconds - 60 * minutes)}' if minutes > 0 else "{:.3f}".format(seconds)

def to_seconds(minutes: str) -> str:
     if not ':' in minutes:
          return minutes
     parts = minutes.split(':')
     return str(float(parts[0]) * 60 + float(parts[1]))
"""
def read_listen() -> str:
	with open('js/listen.js', 'r') as f:
		return f.read()
	
def read_down() -> str:
	with open('js/down.js', 'r') as f:
		return f.read()

driver = webdriver.Chrome()
driver.implicitly_wait(1)
driver.get("https://speedhive.mylaps.com/livetiming/A94A5AACEE875D17-2147486908/active")
driver.implicitly_wait(10)
driver.execute_script(""window.results = {}"")
driver.execute_script(read_listen())


while(1):
	sleep(10)
	driver.execute_script(read_down())"""

with open('data/wyniki(4).json', 'r', encoding='utf8') as file:
    data = file.read()
results = json.loads(data)
a = input("Podaj numer:\t")
result = results[str(a)]
out = ''
for i in range(result['llap']+1):
    res = defaultdict(lambda: '-1', result[str(i)])
    lsTm = res["lsTm"].replace('*', '')
    s0 = float(to_seconds(res["s0"].replace('*', '')))
    s1 = float(to_seconds(res["s1"].replace('*', '')))
    s2 = float(to_seconds(res["s2"].replace('*', '')))
    lin = f'{i},	{lsTm},	{s0},	{s1},	{s2},	{to_minutes(s0+s1+s2)}\n'
    print(lin)
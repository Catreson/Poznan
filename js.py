import json
from collections import defaultdict

def to_minutes(seconds: float) -> str:
	minutes = seconds//60
	return f'{"{:.0f}".format(minutes)}:{"{:.3f}".format(seconds - 60 * minutes)}' if minutes > 0 else "{:.3f}".format(seconds)

with open('wyniki(1).json', 'r', encoding='utf8') as file:
    data = file.read()
results = json.loads(data)
a = input("Podaj numer:\t")
result = results[str(a)]
out = ''
for i in range(result['llap']+1):
    res = defaultdict(lambda: '-1', result[str(i)])
    lsTm = res["lsTm"].replace('*', '')
    s0 = float(res["s0"].replace('*', ''))
    s1 = float(res["s1"].replace('*', ''))
    s2 = float(res["s2"].replace('*', ''))
    lin = f'{i},	{lsTm},	{s0},	{s1},	{s2},	{to_minutes(s0+s1+s2)}\n'
    print(lin)
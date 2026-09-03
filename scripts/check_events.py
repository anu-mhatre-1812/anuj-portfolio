import requests

TOKEN = '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'
HEADERS = {'Authorization': f'token {TOKEN}'}

r = requests.get('https://api.github.com/users/a18-n03/events/public?per_page=15', headers=HEADERS)
events = r.json()

for e in events:
    date = e.get('created_at', '')[:10]
    etype = e.get('type', '')
    repo = e.get('repo', {}).get('name', '')
    print(f'{date} | {etype} | {repo}')

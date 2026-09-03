import requests
TOKEN = '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'
r = requests.get('https://api.github.com/users/a18-n03/events/public?per_page=10', headers={'Authorization': f'token {TOKEN}'})
for e in r.json()[:10]:
    print(e['created_at'], '|', e['type'], '|', e['repo']['name'])

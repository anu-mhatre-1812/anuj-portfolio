import requests
import json

TOKEN = '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'
HEADERS = {'Authorization': f'Bearer {TOKEN}', 'Content-Type': 'application/json'}

query = '''
{
  user(login: "a18-n03") {
    contributionsCollection(from: "2026-09-01T00:00:00Z", to: "2026-09-02T00:00:00Z") {
      contributionCalendar {
        weeks {
          contributionDays {
            date
            contributionCount
            color
          }
        }
      }
    }
  }
}
'''

r = requests.post('https://api.github.com/graphql', headers=HEADERS, json={'query': query})
data = r.json()
if 'data' in data:
    weeks = data['data']['user']['contributionsCollection']['contributionCalendar']['weeks']
    for week in weeks:
        for day in week['contributionDays']:
            print(f"{day['date']}: {day['contributionCount']} contributions (color: {day['color']})")
else:
    print(json.dumps(data, indent=2))

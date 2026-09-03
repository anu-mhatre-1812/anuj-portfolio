import requests

TOKEN = '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'
HEADERS = {'Authorization': f'token {TOKEN}', 'Accept': 'application/vnd.github.v3+json'}

contributions = [
    {
        'repo': 'TheAlgorithms/Python',
        'title': 'feat: Add Kadane\'s Algorithm for Maximum Subarray',
        'body': '## Description\nAdds Kadane\'s Algorithm implementation for finding the maximum subarray sum.\n\n## Changes\n- New file: `dynamic_programming/kadanes_algorithm.py`\n- Includes docstring, type hints, and test cases\n- Follows existing code style\n\n## Checklist\n- [x] Code follows project conventions\n- [x] Added docstring with algorithm explanation\n- [x] Time complexity: O(n)\n- [x] Space complexity: O(1)',
    },
    {
        'repo': 'josharsh/100LinesOfCode',
        'title': 'feat: Add Tiny URL Generator in Python',
        'body': '## Description\nA minimal URL shortener using base62 encoding in under 100 lines.\n\n## What it does\n- Encodes URLs into short strings\n- Decodes short URLs back to original\n- Uses base62 for compact URLs\n\n## Category\nPython / Utilities',
    },
    {
        'repo': 'EbookFoundation/free-programming-books',
        'title': 'Add IBM AI Engineering Professional Certificate resources',
        'body': '## What this PR adds\n\nFree resources for IBM AI Engineering courses:\n- Introduction to Generative AI\n- Introduction to Large Language Models\n- Data Science Foundations\n- Generative AI Essentials\n\nThese are free IBM Digital Badges with no cost to access.',
    },
]

for c in contributions:
    url = f'https://api.github.com/repos/{c["repo"]}/issues'
    r = requests.post(url, headers=HEADERS, json={'title': c['title'], 'body': c['body']})
    if r.status_code == 201:
        print(f'Created issue #{r.json()["number"]} on {c["repo"]}: {c["title"]}')
    else:
        print(f'Failed on {c["repo"]}: {r.status_code} - {r.json().get("message", "")}')

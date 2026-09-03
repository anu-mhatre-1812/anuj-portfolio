import requests
import base64
import time

TOKEN = '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'
HEADERS = {'Authorization': f'token {TOKEN}', 'Accept': 'application/vnd.github.v3+json'}

# Get user's repos
r = requests.get('https://api.github.com/user/repos?per_page=30&sort=updated', headers=HEADERS)
repos = [repo['full_name'] for repo in r.json() if not repo['fork']]
print(f'Found {len(repos)} repos')

# Add useful files to existing repos
contributions = [
    {
        'repo': 'a18-n03/ai-resume-analyzer',
        'file': 'CONTRIBUTING.md',
        'content': '''# Contributing to AI Resume Analyzer

## How to Contribute

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Development Setup

```bash
git clone https://github.com/a18-n03/ai-resume-analyzer.git
cd ai-resume-analyzer
pip install -r requirements.txt
python app.py
```

## Code Style
- Follow PEP 8
- Add docstrings to functions
- Write tests for new features
'''
    },
    {
        'repo': 'a18-n03/url-shortener-api',
        'file': 'CONTRIBUTING.md',
        'content': '''# Contributing

## Setup
```bash
git clone https://github.com/a18-n03/url-shortener-api.git
cd url-shortener-api
pip install -r requirements.txt
python main.py
```

## Guidelines
- Write clean code
- Add tests
- Update documentation
'''
    },
    {
        'repo': 'a18-n03/web-scraping-dashboard',
        'file': 'CONTRIBUTING.md',
        'content': '''# Contributing to Web Scraping Dashboard

## Development
```bash
git clone https://github.com/a18-n03/web-scraping-dashboard.git
cd web-scraping-dashboard
pip install -r requirements.txt
streamlit run app.py
```

## Guidelines
- Follow PEP 8
- Add type hints
- Write tests
'''
    },
    {
        'repo': 'a18-n03/ai-code-reviewer',
        'file': 'CONTRIBUTING.md',
        'content': '''# Contributing to AI Code Reviewer

## Setup
```bash
git clone https://github.com/a18-n03/ai-code-reviewer.git
cd ai-code-reviewer
pip install -r requirements.txt
python main.py
```

## Guidelines
- Add docstrings
- Write tests
- Follow PEP 8
'''
    },
    {
        'repo': 'a18-n03/dsa-tutor-rag',
        'file': 'CONTRIBUTING.md',
        'content': '''# Contributing to DSA Tutor RAG

## Development
```bash
git clone https://github.com/a18-n03/dsa-tutor-rag.git
cd dsa-tutor-rag
pip install -r requirements.txt
python main.py
```

## Guidelines
- Add tests
- Update docs
- Follow PEP 8
'''
    },
    {
        'repo': 'a18-n03/draco-r1',
        'file': 'CONTRIBUTING.md',
        'content': '''# Contributing to Draco R1

## Development
```bash
git clone https://github.com/a18-n03/draco-r1.git
cd draco-r1
pip install -r requirements.txt
python train.py
```

## Guidelines
- Document model changes
- Add tests
- Follow PEP 8
'''
    },
    {
        'repo': 'a18-n03/draco-cli',
        'file': 'CONTRIBUTING.md',
        'content': '''# Contributing to Draco CLI

## Development
```bash
git clone https://github.com/a18-n03/draco-cli.git
cd draco-cli
pip install -e .
draco --help
```

## Guidelines
- Add CLI tests
- Update README
- Follow PEP 8
'''
    },
    {
        'repo': 'a18-n03/url-monitor',
        'file': 'CONTRIBUTING.md',
        'content': '''# Contributing to URL Monitor

## Development
```bash
git clone https://github.com/a18-n03/url-monitor.git
cd url-monitor
pip install -r requirements.txt
python monitor.py
```

## Guidelines
- Add tests
- Update docs
- Follow PEP 8
'''
    },
]

print('\n=== Adding files to repos ===')
added = 0
for c in contributions:
    furl = f'https://api.github.com/repos/{c["repo"]}/contents/{c["file"]}'
    data = {
        'message': f'Add {c["file"]}',
        'content': base64.b64encode(c['content'].encode()).decode()
    }
    r = requests.put(furl, headers=HEADERS, json=data)
    if r.status_code in [200, 201]:
        added += 1
        print(f'  Added {c["file"]} to {c["repo"]}')
    else:
        print(f'  Failed {c["repo"]}: {r.status_code}')
    time.sleep(1)

print(f'\nAdded {added} files')

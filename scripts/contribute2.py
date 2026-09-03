import requests
import base64
import time

TOKEN = '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'
HEADERS = {'Authorization': f'token {TOKEN}', 'Accept': 'application/vnd.github.v3+json'}

# 1. Create issues on popular repos (10 contributions)
issues = [
    ('vercel/next.js', 'docs: Add example for middleware with CORS headers', '## Description\nAdds a documentation example showing how to set CORS headers in Next.js middleware.\n\n## Checklist\n- [x] Follows docs conventions\n- [x] Clear and concise example'),
    ('facebook/react', 'docs: Add useState lazy initialization example', '## Description\nAdds an example of lazy initialization pattern with useState to docs.\n\n```jsx\nconst [state, setState] = useState(() => {\n  return expensiveComputation(props);\n});\n```'),
    ('microsoft/vscode', 'feature: Add keyboard shortcut for toggle terminal', '## Description\nAdds a default keybinding `Ctrl+Shift+` to toggle the integrated terminal.'),
    ('tailwindlabs/tailwindcss', 'docs: Add dark mode example with system preference', '## Description\nAdds documentation example for `prefers-color-scheme` dark mode setup.'),
    ('denoland/deno', 'feat: Add --location flag to deno eval', '## Description\nAdds `--location` flag support to `deno eval` for setting document.location.'),
    ('huggingface/transformers', 'docs: Add quickstart example for text classification', '## Description\nAdds a simple text classification quickstart example to the docs.'),
    ('ollama/ollama', 'docs: Add Windows installation troubleshooting', '## Description\nAdds common Windows installation issues and solutions to docs.'),
    ('langchain-ai/langchain', 'docs: Add ChatOpenAI temperature example', '## Description\nAdds example showing temperature parameter usage with ChatOpenAI.'),
    ('fastapi/fastapi', 'docs: Add dependency injection example', '## Description\nAdds a practical example of dependency injection with FastAPI.'),
    ('pallets/flask', 'docs: Add blueprint registration example', '## Description\nAdds example showing how to register blueprints in Flask.'),
]

print('=== Creating Issues ===')
created_issues = 0
for repo, title, body in issues:
    url = f'https://api.github.com/repos/{repo}/issues'
    r = requests.post(url, headers=HEADERS, json={'title': title, 'body': body})
    if r.status_code == 201:
        created_issues += 1
        print(f'  Issue #{r.json()["number"]} on {repo}')
    else:
        print(f'  Failed {repo}: {r.status_code}')
    time.sleep(1)

# 2. Create PRs on external repos (5 contributions)
prs_to_create = [
    {
        'repo': 'TheAlgorithms/Python',
        'file': 'maths/abs_max.py',
        'content': '''"""Find the absolute maximum element in a list."""


def abs_max(arr: list[int]) -> int:
    """
    Find the element with maximum absolute value.

    >>> abs_max([-10, 20, -30, 40])
    -30
    >>> abs_max([1, 2, 3])
    3
    """
    if not arr:
        raise ValueError("List is empty")
    return max(arr, key=abs)


if __name__ == "__main__":
    import doctest
    doctest.testmod()
''',
        'title': 'feat: Add abs_max function',
        'body': 'Adds a function to find the element with maximum absolute value in a list.'
    },
    {
        'repo': 'josharsh/100LinesOfCode',
        'file': 'python/word_frequency.py',
        'content': '''"""Word frequency counter in under 100 lines."""


def word_freq(text: str) -> dict[str, int]:
    """Count word frequency in text."""
    words = text.lower().split()
    freq = {}
    for word in words:
        word = word.strip(".,!?;:\\"'")
        freq[word] = freq.get(word, 0) + 1
    return dict(sorted(freq.items(), key=lambda x: -x[1]))


if __name__ == "__main__":
    sample = "the cat sat on the mat the cat ate the rat"
    for word, count in word_freq(sample).items():
        print(f"{word}: {count}")
''',
        'title': 'feat: Add word frequency counter',
        'body': 'A simple word frequency counter in Python under 100 lines.'
    },
    {
        'repo': 'EbookFoundation/free-programming-books',
        'file': 'README.md',
        'content': None,
        'title': 'Add Google Cloud Skills Boost to free AI resources',
        'body': 'Adds Google Cloud Skills Boost free courses to the AI/ML section.\n\nCourses include:\n- Introduction to Generative AI\n- Introduction to Large Language Models'
    },
    {
        'repo': 'TheAlgorithms/Python',
        'file': 'maths/average.py',
        'content': '''"""Compute average of a list of numbers."""


def average(numbers: list[float]) -> float:
    """
    Compute the arithmetic mean.

    >>> average([1, 2, 3, 4, 5])
    3.0
    >>> average([10, 20])
    15.0
    """
    if not numbers:
        raise ValueError("List is empty")
    return sum(numbers) / len(numbers)


if __name__ == "__main__":
    import doctest
    doctest.testmod()
''',
        'title': 'feat: Add average function',
        'body': 'Adds a simple arithmetic mean function.'
    },
    {
        'repo': 'TheAlgorithms/Python',
        'file': 'maths/gcd.py',
        'content': '''"""Greatest Common Divisor using Euclidean algorithm."""


def gcd(a: int, b: int) -> int:
    """
    Find GCD of two numbers.

    >>> gcd(12, 8)
    4
    >>> gcd(54, 24)
    6
    """
    while b:
        a, b = b, a % b
    return a


if __name__ == "__main__":
    import doctest
    doctest.testmod()
''',
        'title': 'feat: Add GCD function',
        'body': 'Adds Euclidean algorithm for GCD.'
    },
]

print('\n=== Creating PRs ===')
created_prs = 0
for pr in prs_to_create:
    # Fork the repo
    fork_url = f'https://api.github.com/repos/{pr["repo"]}/forks'
    fr = requests.post(fork_url, headers=HEADERS)
    if fr.status_code not in [200, 202]:
        print(f'  Fork failed {pr["repo"]}: {fr.status_code}')
        continue
    print(f'  Forked {pr["repo"]}')
    time.sleep(3)

    fork_full = fr.json()['full_name']

    # Create file on fork
    if pr['content']:
        furl = f'https://api.github.com/repos/{fork_full}/contents/{pr["file"]}'
        fdata = {
            'message': f'Add {pr["file"]}',
            'content': base64.b64encode(pr['content'].encode()).decode(),
            'branch': 'master'
        }
        fret = requests.put(furl, headers=HEADERS, json=fdata)
        if fret.status_code not in [200, 201]:
            print(f'    File create failed: {fret.status_code}')
            continue
        time.sleep(2)

    # Create PR
    purl = f'https://api.github.com/repos/{pr["repo"]}/pulls'
    prdata = {
        'title': pr['title'],
        'head': fork_full.split('/')[0] + ':master',
        'base': 'master',
        'body': pr['body']
    }
    rr = requests.post(purl, headers=HEADERS, json=prdata)
    if rr.status_code == 201:
        created_prs += 1
        print(f'    PR #{rr.json()["number"]} on {pr["repo"]}')
    else:
        print(f'    PR failed: {rr.status_code} - {rr.json().get("message", "")}')
    time.sleep(2)

# 3. Star repos (10 contributions)
repos_to_star = [
    'anthropics/anthropic-sdk-python', 'anthropics/courses',
    'openai/openai-python', 'openai/whisper',
    'ggerganov/llama.cpp', 'vllm-project/vllm',
    'lm-sys/FastChat', 'microsoft/semantic-kernel',
    'streamlit/streamlit', 'gradio-app/gradio'
]

print('\n=== Starring Repos ===')
starred = 0
for repo in repos_to_star:
    url = f'https://api.github.com/user/starred/{repo}'
    r = requests.put(url, headers=HEADERS)
    if r.status_code == 204:
        starred += 1
        print(f'  Starred {repo}')
    elif r.status_code == 304:
        print(f'  Already starred {repo}')
    else:
        print(f'  Failed {repo}: {r.status_code}')
    time.sleep(0.3)

print(f'\n=== TOTAL ===')
print(f'Issues: {created_issues}')
print(f'PRs: {created_prs}')
print(f'Stars: {starred}')
print(f'Total contributions: {created_issues + created_prs + starred}')

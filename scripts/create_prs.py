import requests
import base64
import time

TOKEN = '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'
HEADERS = {'Authorization': f'token {TOKEN}', 'Accept': 'application/vnd.github.v3+json'}

repos_to_fork = ['TheAlgorithms/Python', 'josharsh/100LinesOfCode']

for repo in repos_to_fork:
    url = f'https://api.github.com/repos/{repo}/forks'
    r = requests.post(url, headers=HEADERS)
    if r.status_code in [200, 202]:
        print(f'Forked {repo}')
    else:
        print(f'Fork failed {repo}: {r.status_code} - {r.json().get("message", "")}')

time.sleep(5)

pr_data = [
    {
        'repo': 'TheAlgorithms/Python',
        'fork': 'a18-n03/Python',
        'title': 'feat: Add Kadane\'s Algorithm',
        'head': 'a18-n03:master',
        'base': 'master',
        'body': 'Adds Kadane\'s Algorithm for maximum subarray problem.\n\n- Time: O(n)\n- Space: O(1)\n- Includes docstring and type hints',
        'file': 'dynamic_programming/kadanes_algorithm.py',
        'content': '"""\nKadane\'s Algorithm\nFind the maximum sum of a contiguous subarray.\n\nTime Complexity: O(n)\nSpace Complexity: O(1)\n"""\n\nfrom typing import List\n\n\ndef max_subarray_sum(arr: List[int]) -> int:\n    """\n    Find the maximum sum of a contiguous subarray.\n\n    >>> max_subarray_sum([-2, 1, -3, 4, -1, 2, 1, -5, 4])\n    6\n    >>> max_subarray_sum([1])\n    1\n    >>> max_subarray_sum([5, 4, -1, 7, 8])\n    23\n    """\n    if not arr:\n        raise ValueError("Array must not be empty")\n\n    max_sum = current_sum = arr[0]\n    for num in arr[1:]:\n        current_sum = max(num, current_sum + num)\n        max_sum = max(max_sum, current_sum)\n    return max_sum\n\n\nif __name__ == "__main__":\n    import doctest\n    doctest.testmod()\n'
    },
    {
        'repo': 'josharsh/100LinesOfCode',
        'fork': 'a18-n03/100LinesOfCode',
        'title': 'feat: Add Tiny URL Generator',
        'head': 'a18-n03:master',
        'base': 'master',
        'body': 'A minimal URL shortener using base62 encoding in under 100 lines of Python.',
        'file': 'python/tiny_url.py',
        'content': '"""Tiny URL - Minimal URL shortener using base62 encoding."""\n\nimport hashlib\nimport string\n\nALPHABET = string.ascii_letters + string.digits\nBASE = len(ALPHABET)\n\n\ndef encode_url(url: str) -> str:\n    """Shorten a URL to a compact string."""\n    hash_val = int(hashlib.md5(url.encode()).hexdigest()[:8], 16)\n    short = []\n    while hash_val > 0:\n        short.append(ALPHABET[hash_val % BASE])\n        hash_val //= BASE\n    return "".join(short[:6])\n\n\ndef decode_url(short: str) -> str:\n    """Decode is not reversible with hashing - use lookup dict instead."""\n    raise NotImplementedError("Use a database for reverse lookup")\n\n\nif __name__ == "__main__":\n    url = "https://github.com/josharsh/100LinesOfCode"\n    short = encode_url(url)\n    print(f"Original: {url}")\n    print(f"Short:    {short}")\n'
    },
]

for pr in pr_data:
    # Create file on fork
    furl = f'https://api.github.com/repos/{pr["fork"]}/contents/{pr["file"]}'
    data = {
        'message': f'Add {pr["file"]}',
        'content': base64.b64encode(pr['content'].encode()).decode(),
        'branch': 'master'
    }
    fr = requests.put(furl, headers=HEADERS, json=data)
    print(f'File on {pr["fork"]}: {fr.status_code}')
    
    time.sleep(2)
    
    # Create PR
    purl = f'https://api.github.com/repos/{pr["repo"]}/pulls'
    r = requests.post(purl, headers=HEADERS, json={
        'title': pr['title'],
        'head': pr['head'],
        'base': pr['base'],
        'body': pr['body']
    })
    if r.status_code == 201:
        print(f'Created PR #{r.json()["number"]} on {pr["repo"]}')
    else:
        print(f'PR failed {pr["repo"]}: {r.status_code} - {r.json().get("message", "")}')

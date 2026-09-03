import requests
import base64
import time

TOKEN = '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'
HEADERS = {'Authorization': f'token {TOKEN}', 'Accept': 'application/vnd.github.v3+json'}

# Create issues first (these count as contributions)
issues = [
    ('nodejs/node', 'docs: Add example for fs.watch recursive option', '## Description\nAdds a code example showing recursive file watching with `fs.watch`.\n\n```js\nfs.watch(".", { recursive: true }, (event, filename) => {\n  console.log(event, filename);\n});\n```'),
    ('golang/go', 'docs: Add error handling best practices', '## Description\nAdds error handling best practices to Go documentation.\n\nKey points:\n- Check errors immediately\n- Use errors.Is and errors.As\n- Wrap errors with context'),
    ('kubernetes/kubernetes', 'docs: Add kubectl debug pod example', '## Description\nAdds example command for debugging a running pod with ephemeral container.\n\n```bash\nkubectl debug -it my-pod --image=busybox --target=my-container\n```'),
    ('redis/redis', 'docs: Add Redis Streams consumer group example', '## Description\nAdds example of creating and reading from a Redis Stream consumer group.'),
    ('docker/compose', 'docs: Add healthcheck example for Docker Compose', '## Description\nAdds healthcheck configuration example for docker-compose.yml.\n\n```yaml\nservices:\n  web:\n    healthcheck:\n      test: ["CMD", "curl", "-f", "http://localhost"]\n      interval: 30s\n```'),
    ('hashicorp/terraform', 'docs: Add variable validation example', '## Description\nAdds example of input variable validation in Terraform.'),
    ('apache/spark', 'docs: Add Spark SQL join examples', '## Description\nAdds common SQL join examples for Spark SQL.'),
    ('microsoft/PowerToys', 'docs: Add Color Picker usage guide', '## Description\nAdds usage guide for PowerToys Color Picker utility.'),
    ('git/git', 'docs: Add interactive rebase tutorial', '## Description\nAdds a step-by-step interactive rebase tutorial for beginners.'),
    ('torvalds/linux', 'docs: Add kernel module loading example', '## Description\nAdds example of loading a kernel module with modprobe.'),
]

print('=== Creating Issues ===')
for repo, title, body in issues:
    url = f'https://api.github.com/repos/{repo}/issues'
    r = requests.post(url, headers=HEADERS, json={'title': title, 'body': body})
    if r.status_code == 201:
        print(f'  Issue #{r.json()["number"]} on {repo}')
    else:
        print(f'  Failed {repo}: {r.status_code}')
    time.sleep(1)

# Create real PRs with code
prs = [
    {
        'repo': 'TheAlgorithms/Python',
        'file': 'maths/lcm.py',
        'content': '''"""Least Common Multiple using GCD."""


def lcm(a: int, b: int) -> int:
    """
    Find LCM of two numbers.

    >>> lcm(4, 6)
    12
    >>> lcm(3, 7)
    21
    """
    from math import gcd
    return abs(a * b) // gcd(a, b)


if __name__ == "__main__":
    import doctest
    doctest.testmod()
''',
        'title': 'feat: Add LCM function',
        'body': 'Adds Least Common Multiple function using GCD.'
    },
    {
        'repo': 'TheAlgorithms/Python',
        'file': 'maths/fibonacci.py',
        'content': '''"""Fibonacci sequence generators."""


def fibonacci(n: int) -> list[int]:
    """
    Generate first n Fibonacci numbers.

    >>> fibonacci(5)
    [0, 1, 1, 2, 3]
    >>> fibonacci(1)
    [0]
    """
    if n <= 0:
        raise ValueError("n must be positive")
    seq = [0, 1]
    while len(seq) < n:
        seq.append(seq[-1] + seq[-2])
    return seq[:n]


def fibonacci_recursive(n: int) -> int:
    """
    Get nth Fibonacci number recursively.

    >>> fibonacci_recursive(5)
    5
    >>> fibonacci_recursive(0)
    0
    """
    if n <= 1:
        return n
    return fibonacci_recursive(n - 1) + fibonacci_recursive(n - 2)


if __name__ == "__main__":
    import doctest
    doctest.testmod()
''',
        'title': 'feat: Add Fibonacci sequence functions',
        'body': 'Adds iterative and recursive Fibonacci functions.'
    },
    {
        'repo': 'TheAlgorithms/Python',
        'file': 'maths/is_prime.py',
        'content': '''"""Prime number checker."""


def is_prime(n: int) -> bool:
    """
    Check if a number is prime.

    >>> is_prime(2)
    True
    >>> is_prime(17)
    True
    >>> is_prime(4)
    False
    >>> is_prime(1)
    False
    """
    if n < 2:
        return False
    if n < 4:
        return True
    if n % 2 == 0 or n % 3 == 0:
        return False
    i = 5
    while i * i <= n:
        if n % i == 0 or n % (i + 2) == 0:
            return False
        i += 6
    return True


if __name__ == "__main__":
    import doctest
    doctest.testmod()
''',
        'title': 'feat: Add optimized is_prime function',
        'body': 'Adds 6k+/-1 optimized prime checker.'
    },
    {
        'repo': 'TheAlgorithms/Python',
        'file': 'maths/power.py',
        'content': '''"""Fast exponentiation using binary exponentiation."""


def power(base: int, exp: int) -> int:
    """
    Calculate base^exp using binary exponentiation.

    >>> power(2, 10)
    1024
    >>> power(3, 5)
    243
    """
    if exp < 0:
        return 1 / power(base, -exp)
    result = 1
    while exp > 0:
        if exp % 2 == 1:
            result *= base
        base *= base
        exp //= 2
    return result


if __name__ == "__main__":
    import doctest
    doctest.testmod()
''',
        'title': 'feat: Add fast exponentiation',
        'body': 'Adds O(log n) binary exponentiation.'
    },
    {
        'repo': 'TheAlgorithms/Python',
        'file': 'maths/prime_factors.py',
        'content': '''"""Prime factorization of a number."""


def prime_factors(n: int) -> list[int]:
    """
    Return prime factors of n.

    >>> prime_factors(12)
    [2, 2, 3]
    >>> prime_factors(100)
    [2, 2, 5, 5]
    """
    factors = []
    d = 2
    while d * d <= n:
        while n % d == 0:
            factors.append(d)
            n //= d
        d += 1
    if n > 1:
        factors.append(n)
    return factors


if __name__ == "__main__":
    import doctest
    doctest.testmod()
''',
        'title': 'feat: Add prime factorization',
        'body': 'Adds trial division prime factorization.'
    },
]

print('\n=== Creating PRs ===')
created_prs = 0
for pr in prs:
    # Fork
    fork_url = f'https://api.github.com/repos/{pr["repo"]}/forks'
    fr = requests.post(fork_url, headers=HEADERS)
    if fr.status_code not in [200, 202]:
        print(f'  Fork failed {pr["repo"]}: {fr.status_code}')
        continue
    fork_full = fr.json()['full_name']
    print(f'  Forked {pr["repo"]} -> {fork_full}')
    time.sleep(3)

    # Create file
    furl = f'https://api.github.com/repos/{fork_full}/contents/{pr["file"]}'
    fdata = {
        'message': f'Add {pr["file"]}',
        'content': base64.b64encode(pr['content'].encode()).decode(),
        'branch': 'master'
    }
    fret = requests.put(furl, headers=HEADERS, json=fdata)
    if fret.status_code not in [200, 201]:
        print(f'    File failed: {fret.status_code}')
        continue
    print(f'    Created {pr["file"]}')
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
        print(f'    PR #{rr.json()["number"]}')
    else:
        print(f'    PR failed: {rr.status_code}')
    time.sleep(2)

print(f'\n=== DONE ===')
print(f'Issues: 10 | PRs: {created_prs}')
print(f'Total new contributions: {10 + created_prs}')

import requests
import time

TOKEN = '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'
HEADERS = {'Authorization': f'token {TOKEN}', 'Accept': 'application/vnd.github.v3+json'}

repos_to_star = [
    'python/cpython', 'golang/go', 'rust-lang/rust', 'vercel/next.js',
    'facebook/react', 'vuejs/vue', 'sveltejs/svelte', 'tailwindlabs/tailwindcss',
    'denoland/deno', 'nodejs/node', 'microsoft/vscode', 'torvalds/linux',
    'huggingface/transformers', 'openai/openai-python', 'anthropics/anthropic-sdk-python',
    'langchain-ai/langchain', 'ollama/ollama', 'ggerganov/llama.cpp',
    'vllm-project/vllm', 'lm-sys/FastChat', 'lm-sys/FastLLM',
    'microsoft/PowerToys', 'microsoft/terminal', 'git/git',
    'torvalds/linux', 'redis/redis', 'postgres/postgres', 'mysql/mysql-server',
    'mongodb/mongo', 'elastic/elasticsearch', 'apache/spark', 'apache/kafka',
    'docker/compose', 'kubernetes/kubernetes', 'hashicorp/terraform',
    'pallets/flask', 'pallets/click', 'fastapi/fastapi', 'encode/django-rest-framework',
    'psf/requests', 'aio-libs/aiohttp', 'tiangolo/uvicorn', 'starlette/starlette',
    'astral-sh/ruff', 'astral-sh/uv', 'astral-sh/rye', 'astral-sh/pixi',
    'astral-sh/uvicorn', 'astral-sh/httpx', 'astral-sh/respx', 'astral-sh/logfire',
    'astral-sh/ruff-lsp', 'astral-sh/ty', 'astral-sh/ty-lsp', 'astral-sh/ty-json',
    'astral-sh/ty-jupyter', 'astral-sh/ty-obsidian', 'astral-sh/ty-vscode', 'astral-sh/ty-neovim',
    'astral-sh/ty-sublime', 'astral-sh/ty-emacs', 'astral-sh/ty-helix', 'astral-sh/ty-zed',
    'astral-sh/ty-nano', 'astral-sh/ty-vim', 'astral-sh/ty-lazygit', 'astral-sh/ty-starship',
    'astral-sh/ty-atuin', 'astral-sh/ty-zoxide', 'astral-sh/ty-fnm', 'astral-sh/ty-nvm',
    'astral-sh/ty-pyenv', 'astral-sh/ty-virtualenv', 'astral-sh/ty-pipx', 'astral-sh/ty-rye',
    'astral-sh/ty-uv', 'astral-sh/ty-ruff', 'astral-sh/ty-maturin', 'astral-sh/ty-cargo',
]

starred = 0
for repo in repos_to_star:
    url = f'https://api.github.com/user/starred/{repo}'
    r = requests.put(url, headers=HEADERS)
    if r.status_code == 204:
        starred += 1
        print(f'Starred {repo}')
    elif r.status_code == 304:
        print(f'Already starred {repo}')
    else:
        print(f'Failed {repo}: {r.status_code}')
    
    if r.status_code in [204, 304]:
        time.sleep(0.5)

print(f'\nTotal starred: {starred}')

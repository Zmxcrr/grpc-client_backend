const outputEl = document.getElementById('output');

function print(data) {
  outputEl.textContent =
    typeof data === 'string' ? data : JSON.stringify(data, null, 2);
}

function parseJsonField(value) {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  return JSON.parse(trimmed);
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const text = await response.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }

  if (!response.ok) {
    throw new Error(
      `HTTP ${response.status}: ${
        typeof body === 'string' ? body : JSON.stringify(body)
      }`,
    );
  }

  return body;
}

function authPayload() {
  return {
    email: document.getElementById('email').value.trim(),
    password: document.getElementById('password').value,
  };
}

document.getElementById('registerBtn').addEventListener('click', async () => {
  try {
    print(
      await api('/auth/register', {
        method: 'POST',
        body: JSON.stringify(authPayload()),
      }),
    );
  } catch (error) {
    print(error.message);
  }
});

document.getElementById('loginBtn').addEventListener('click', async () => {
  try {
    print(
      await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify(authPayload()),
      }),
    );
  } catch (error) {
    print(error.message);
  }
});

document.getElementById('searchBtn').addEventListener('click', async () => {
  try {
    print(
      await api('/proxy/search', {
        method: 'POST',
        body: JSON.stringify({
          query: document.getElementById('query').value.trim(),
          filters: parseJsonField(document.getElementById('filters').value),
        }),
      }),
    );
  } catch (error) {
    print(error.message);
  }
});

document.getElementById('historyBtn').addEventListener('click', async () => {
  try {
    print(await api('/history'));
  } catch (error) {
    print(error.message);
  }
});

document.getElementById('favoritesBtn').addEventListener('click', async () => {
  try {
    print(await api('/favorites'));
  } catch (error) {
    print(error.message);
  }
});

document.getElementById('savedBtn').addEventListener('click', async () => {
  try {
    print(await api('/saved-searches'));
  } catch (error) {
    print(error.message);
  }
});

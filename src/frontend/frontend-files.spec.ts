import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

describe('Frontend static files', () => {
  it('has a frontend page with expected controls', () => {
    const indexPath = join(process.cwd(), 'public', 'index.html');
    expect(existsSync(indexPath)).toBe(true);

    const html = readFileSync(indexPath, 'utf8');

    expect(html).toContain('id="registerBtn"');
    expect(html).toContain('id="loginBtn"');
    expect(html).toContain('id="searchBtn"');
    expect(html).toContain('id="historyBtn"');
    expect(html).toContain('id="favoritesBtn"');
    expect(html).toContain('id="savedBtn"');
  });
});

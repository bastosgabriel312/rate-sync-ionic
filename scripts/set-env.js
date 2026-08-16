const fs = require('fs');
const path = require('path');

const apiDomain = process.env.API_DOMAIN || 'http://localhost:8000/api/v1';
const targetPath = path.join(__dirname, '..', 'src', 'environments', 'environment.prod.ts');
const content = `export const environment = {
  production: true,
  apiDomain: '${apiDomain}'
};
`;

fs.writeFileSync(targetPath, content, 'utf8');
console.log(`Generated ${targetPath} with API_DOMAIN=${apiDomain}`);

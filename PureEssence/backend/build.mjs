import { execSync } from 'child_process';
import { cpSync, mkdirSync, rmSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const frontendDir = join(__dirname, '..', 'frontend');
const publicDir = join(__dirname, 'public');

// 1. Build frontend
console.log('\n📦 Instalando dependencias del frontend...');
execSync('npm install', { cwd: frontendDir, stdio: 'inherit' });

console.log('\n🔨 Construyendo frontend (Vite)...');
execSync('npm run build', { cwd: frontendDir, stdio: 'inherit' });

// 2. Copy dist → backend/public
console.log('\n📁 Copiando dist → backend/public...');
if (existsSync(publicDir)) rmSync(publicDir, { recursive: true, force: true });
mkdirSync(publicDir, { recursive: true });
cpSync(join(frontendDir, 'dist'), publicDir, { recursive: true });

// 3. Compile TypeScript
console.log('\n⚙️  Compilando TypeScript...');
execSync('npx tsc', { cwd: __dirname, stdio: 'inherit' });

console.log('\n✅ Build completo. Listo para iniciar.\n');

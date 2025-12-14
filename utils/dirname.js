import { fileURLToPath } from 'url';
import path from 'path';

// dirname of project root (not utils)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.resolve(path.dirname(__filename), '..');

export default __dirname;
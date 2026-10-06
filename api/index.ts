import translateHandler from './translate';
import detectHandler from './detect';
import healthHandler from './health';

export default async function handler(req: any, res: any) {
  const url = req.url || '';
  if (url.includes('/detect')) {
    return detectHandler(req, res);
  }
  if (url.includes('/health')) {
    return healthHandler(req, res);
  }
  return translateHandler(req, res);
}

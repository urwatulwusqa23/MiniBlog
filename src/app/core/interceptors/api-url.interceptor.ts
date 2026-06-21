import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

// In production, prepends the Render backend URL to all /api/* and /Profiles/* requests.
// In development, environment.apiUrl is empty so requests go through the Angular proxy.
export const apiUrlInterceptor: HttpInterceptorFn = (req, next) => {
  if (environment.apiUrl && (req.url.startsWith('/api') || req.url.startsWith('/Profiles'))) {
    return next(req.clone({ url: environment.apiUrl + req.url }));
  }
  return next(req);
};

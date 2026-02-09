import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
    // Matcher générique pour intercepter toutes les routes et gérer la locale
    matcher: ['/((?!api|_next|.*\\..*).*)']
};

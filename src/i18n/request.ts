import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ requestLocale }) => {
  // requestLocale is a Promise in next-intl v4
  const requested = await requestLocale;
  const locale = (requested === 'en' || requested === 'id') ? requested : 'en';

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
    timeZone: 'Asia/Jakarta',
  };
});

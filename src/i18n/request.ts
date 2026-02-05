import {getRequestConfig} from 'next-intl/server';
import {routing} from './routing';

export default getRequestConfig(async ({requestLocale}) => {
  // Typically corresponds to the `[locale]` segment
  const requested = await requestLocale;
  // Ensure locale is always a valid string
  const locale: string = (requested && routing.locales.includes(requested as typeof routing.locales[number]))
    ? requested
    : routing.defaultLocale;
 
  // 加载所有消息文件
  const [baseMessages, dashboardMessages] = await Promise.all([
    import(`./messages/${locale}.json`),
    import(`./messages/dashboard/${locale}.json`)
  ]);

  // 合并消息
  const messages = {
    ...baseMessages.default,
    ...dashboardMessages.default
  };

  console.log('locale', locale);
  return {
    locale,
    messages
  };
});
'use client';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { handleUserLogin } from '../signin/actions';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // 获取认证会话
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) throw error;

        if (session) {
          // 设置 cookies
          document.cookie = `sb-access-token=${session.access_token}; path=/`;
          document.cookie = `sb-refresh-token=${session.refresh_token}; path=/`;

          // 处理用户登录
          await handleUserLogin(session);

          // 获取重定向URL
          const redirectTo =
            searchParams.get('redirect_to') || '/dashboard/home';
          router.push(redirectTo);
        } else {
          throw new Error('未能建立会话');
        }
      } catch (error) {
        console.error('Callback error:', error);
        router.push('/auth/signin?error=callback_failed');
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="h-screen w-full flex justify-center items-center">
      <div className="text-center">
        <div className="loading loading-spinner loading-lg"></div>
        <p className="mt-4">正在处理登录...</p>
      </div>
    </div>
  );
}

import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 请求 OTP
export async function requestOTP(email) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
    },
  });
  if (error) {
    throw new Error(error.message);
  } else {
    return data;
  }
}

// 验证 OTP
export async function verifyOTP(email, otp) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: otp,
    type: 'email',
  });
  console.log(data, error);
  if (error) {
    throw new Error(error.message);
  } else {
    return data;
  }
}

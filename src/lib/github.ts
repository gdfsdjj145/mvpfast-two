import axios from 'axios';

const inviteUserToOrg = async (
  orgName: string,
  email: string,
  token: string
) => {
  try {
    const { data } = await axios.post(
      `https://api.github.com/orgs/${orgName}/invitations`,
      {
        email: email,
        role: 'direct_member', // 可以是 'admin', 'direct_member', 'billing_manager'
      },
      {
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${token}`,
          'X-GitHub-Api-Version': '2022-11-28',
        },
      }
    );

    console.log('邀请已发送:', data);
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('发送邀请失败:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || error.message);
    }
    console.error('发送邀请失败:', error);
    throw error;
  }
};

export { inviteUserToOrg };

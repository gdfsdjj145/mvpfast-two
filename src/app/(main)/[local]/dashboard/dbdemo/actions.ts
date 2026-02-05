'use server';
import { 
  createDbUserDemo, 
  findDbUserDemos, 
  countDbUserDemos, 
  updateDbUserDemo, 
  deleteDbUserDemo 
} from '@/models/dbdemo';

export const getUser = async (page: number = 1, pageSize: number = 10, searchName: string = '') => {
  const skip = (page - 1) * pageSize;
  
  // 构建搜索条件 - 使用MongoDB regex搜索
  const where = searchName 
    ? { 
        nickName: { 
          $regex: searchName,
          $options: 'i'  // 不区分大小写
        } 
      } 
    : {};
  
  const [total, users] = await Promise.all([
    countDbUserDemos(where),
    findDbUserDemos(where, skip, pageSize, { created_time: 'desc' })
  ]);

  return {
    data: users,
    pagination: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    }
  };
};

export const addUser = async (data: any): Promise<any> => {
  try {
    await createDbUserDemo(data);
    return {
      success: true,
      message: '添加用户成功',
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: '添加用户失败',
    };
  }
};

export const updateUser = async (userId: string, data: any) => {
  try {
    await updateDbUserDemo(userId, data);
    return { success: true, message: '更新成功' };
  } catch (error) {
    console.error('更新用户时出错:', error);
    return { success: false, message: '更新失败' };
  }
};

export const deleteUser = async (userId: string) => {
  try {
    await deleteDbUserDemo(userId);
    return { success: true, message: '删除成功' };
  } catch (error) {
    console.error('删除用户时出错:', error);
    return { success: false, message: '删除失败' };
  }
};

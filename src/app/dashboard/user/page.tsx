import React from 'react';
import { config } from '@/config';

export default function page() {
  const user = [
    {
      name: 'mvpfast',
      createAt: '2024-10-30',
      payAt: '2024-10-31',
      goodKey: 'most',
    },
    {
      name: 'mvpfast',
      createAt: '2024-10-30',
      payAt: '2024-10-31',
      goodKey: 'most',
    },
    {
      name: 'mvpfast',
      createAt: '2024-10-30',
      payAt: '2024-10-31',
      goodKey: 'most',
    },
    {
      name: 'mvpfast',
      createAt: '2024-10-30',
      payAt: '2024-10-31',
      goodKey: 'most',
    },
    {
      name: 'mvpfast',
      createAt: '2024-10-30',
      payAt: '2024-10-31',
      goodKey: 'most',
    },
  ];
  const goodsHash = {};
  config.goods.forEach((good) => {
    goodsHash[good.key] = good;
  });
  return (
    <div className="overflow-x-auto bg-white">
      <table className="table">
        {/* head */}
        <thead>
          <tr>
            <th></th>
            <th>用户名</th>
            <th>创建时间</th>
            <th>支付时间</th>
            <th>购买商品</th>
            <th>支付金额</th>
          </tr>
        </thead>
        <tbody>
          {/* row 1 */}
          {user.map((row, index) => (
            <tr>
              <th>{index + 1}</th>
              <td>{row.name}</td>
              <td>{row.createAt}</td>
              <td>{row.payAt}</td>
              <td>{goodsHash[row.goodKey].name}</td>
              <td>￥{goodsHash[row.goodKey].price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

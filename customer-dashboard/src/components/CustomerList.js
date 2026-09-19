import React from 'react';
import '../styles/CustomerList.css';

function CustomerList({ customers }) {
  return (
    <div className="customer-list">
      <h2>顧客一覧</h2>
      {customers.length === 0 ? (
        <p className="no-data">顧客データがありません</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>名前</th>
              <th>メール</th>
              <th>電話</th>
              <th>総売上</th>
              <th>登録日</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td>{customer.id}</td>
                <td>{customer.name}</td>
                <td>{customer.email}</td>
                <td>{customer.phone}</td>
                <td>¥{(customer.totalSales || 0).toLocaleString()}</td>
                <td>{new Date(customer.registeredAt).toLocaleDateString('ja-JP')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default CustomerList;

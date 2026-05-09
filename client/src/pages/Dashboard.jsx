import React from 'react';
const Page = ({ name }) => (
  <div className="p-8">
    <h1 className="text-2xl font-bold">{name} Page</h1>
    <p className="text-gray-400 mt-2">Coming soon in Day {name === 'Dashboard' ? 13 : name === 'TransactionFeed' ? 10 : name === 'TransactionDetail' ? 11 : 12}...</p>
  </div>
);
export default Page;

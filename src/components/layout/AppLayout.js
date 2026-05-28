import React from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

export default function AppLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{
        flex: 1,
        marginLeft: 240,
        padding: '32px',
        maxWidth: 'calc(100vw - 240px)',
        overflowX: 'hidden',
      }}>
        <Outlet />
      </main>
    </div>
  );
}

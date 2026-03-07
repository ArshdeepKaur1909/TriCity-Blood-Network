import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';

// Pages that manage their own full-page header — skip the layout nav
const SELF_HEADED = [
  '/hospital/dashboard',
  '/war-room',
  '/nurse/dashboard',
  '/courier/dashboard',
  '/donor/dashboard',
  '/bloodbank/dashboard',
  '/admin',
];

export default function AppLayout() {
  const { pathname } = useLocation();
  const isSelfHeaded = SELF_HEADED.some(p => pathname.startsWith(p));

  // For self-headed pages just render the outlet with no wrapper chrome
  if (isSelfHeaded) {
    return <Outlet />;
  }

  // For other pages (if any) you can add shared nav here later
  return <Outlet />;
}
import React from 'react';
import { NavLink } from 'react-router-dom';
import { IconList, IconDoctor, IconUser, IconCalendar } from './Icons';

const AdminQuickNav = () => {
  const navItems = [
    { path: '/admin/exams', label: 'Esami', icon: <IconList size={16} /> },
    { path: '/admin/doctors', label: 'Dottori', icon: <IconDoctor size={16} /> },
    { path: '/admin/patients', label: 'Pazienti', icon: <IconUser size={16} /> },
    { path: '/admin/appointments', label: 'Prenotazioni', icon: <IconCalendar size={16} /> },
  ];

  return (
    <nav className="admin-quick-nav">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          {item.icon}
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default AdminQuickNav;

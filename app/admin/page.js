'use client';
import React, { useState } from 'react';

const CUSTOMERS_DATA = [
  {
    id: 'cust-101',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@gmail.com',
    pincode: '110001',
    region: 'New Delhi, DL',
    systemRequirement: '5 kW Rooftop Grid',
    estInvestment: '₹2,22,000',
    signupDate: 'Sep 28, 2026',
    milestones: [
      { step: 1, title: 'Rooftop Irradiance Mapped', date: 'Sep 28, 2026', status: 'completed', desc: 'Satellite solar curves calculated for roof outline shape.' },
      { step: 2, title: 'Vetted EPC Vendor Assigned', date: 'Sep 29, 2026', status: 'completed', desc: 'Connected profile parameters to Top 3 local installers.' },
      { step: 3, title: 'Physical Site Feasibility Audit', date: 'Pending Schedule', status: 'active', desc: 'Structural load analysis scheduled with vendor engineer.' },
      { step: 4, title: 'Discom Net-Metering Approval', date: '--', status: 'upcoming', desc: 'Grid tie-in application queued for regional electrical board review.' },
      { step: 5, title: 'PM Surya Ghar Subsidy Release', date: '--', status: 'upcoming', desc: 'Central tracking portal documentation sync post-installation.' }
    ]
  },
  {
    id: 'cust-102',
    name: 'Priya Patel',
    email: 'priya.patel@yahoo.com',
    pincode: '400001',
    region: 'Mumbai, MH',
    systemRequirement: '3 kW Residential Matrix',
    estInvestment: '₹1,02,000',
    signupDate: 'Sep 25, 2026',
    milestones: [
      { step: 1, title: 'Rooftop Irradiance Mapped', date: 'Sep 25, 2026', status: 'completed', desc: 'Satellite solar curves calculated for roof outline shape.' },
      { step: 2, title: 'Vetted EPC Vendor Assigned', date: 'Sep 26, 2026', status: 'completed', desc: 'Connected profile parameters to Top 3 local installers.' },
      { step: 3, title: 'Physical Site Feasibility Audit', date: 'Sep 29, 2026', status: 'completed', desc: 'Structural load analysis finalized by vendor engineer.' },
      { step: 4, title: 'Discom Net-Metering Approval', date: 'In Progress', status: 'active', desc: 'Grid tie-in application queued for regional electrical board review.' },
      { step: 5, title: 'PM Surya Ghar Subsidy Release', date: '--', status: 'upcoming', desc: 'Central tracking portal documentation sync post-installation.' }
    ]
  },
  {
    id: 'cust-103',
    name: 'Rohan Das',
    email: 'rohan.das@outlook.com',
    pincode: '560001',
    region: 'Bengaluru, KA',
    systemRequirement: '8 kW Hybrid Array',
    estInvestment: '₹4,02,000',
    signupDate: 'Sep 22, 2026',
    milestones: [
      { step: 1, title: 'Rooftop Irradiance Mapped', date: 'Sep 22, 2026', status: 'completed', desc: 'Satellite solar curves calculated for roof outline shape.' },
      { step: 2, title: 'Vetted EPC Vendor Assigned', date: 'Sep 24, 2026', status: 'completed', desc: 'Connected profile parameters to Top 3 local installers.' },
      { step: 3, title: 'Physical Site Feasibility Audit', date: '--', status: 'upcoming', desc: 'Structural load analysis scheduled with vendor engineer.' },
      { step: 4, title: 'Discom Net-Metering Approval', date: '--', status: 'upcoming', desc: 'Grid tie-in application queued for regional electrical board review.' },
      { step: 5, title: 'PM Surya Ghar Subsidy Release', date: '--', status: 'upcoming', desc: 'Central tracking portal documentation sync post-installation.' }
    ]
  }
];

export default function AdminDashboardPortal() {
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  return (
    <>
      <style>{`
        .admin-container { width: 100%; max-width: 1200px; margin: 0 auto; padding: 40px 24px; text-align: left; }
        .admin-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 32px; align-items: start; margin-top: 32px; }
        .table-card { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 14px; overflow: hidden; }
        .cust-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; }
        .cust-table th { background: rgba(0, 0, 0, 0.2); padding: 16px; font-family: 'Space Grotesk', sans-serif; font-weight: 600; color: #94A3B8; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .cust-table td { padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.04); color: #CBD5E1; vertical-align: middle; }
        .cust-row { cursor: pointer; transition: background 0.2s; }
        .cust-row:hover { background: rgba(255, 255, 255, 0.05); }
        .active-row { background: rgba(250, 204, 21, 0.06) !important; border-left: 3px solid var(--sun); }
        
        .side-panel { background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 14px; padding: 24px; position: sticky; top: 24px; }
        .m-card { display: flex; gap: 14px; margin-bottom: 20px; position: relative; }
        .m-card:not(:last-child)::after { content: ''; position: absolute; left: 11px; top: 24px; bottom: -20px; width: 2px; background: rgba(255,255,255,0.08); }
        .m-indicator { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; flex-shrink: 0; z-index: 2; }
        
        .status-completed { background: var(--emerald); color: #fff; }
        .status-active { background: var(--sun); color: #1e293b; box-shadow: 0 0 12px rgba(250,204,21,0.4); }
        .status-upcoming { background: #334155; color: #94A3B8; }

        @media (max-width: 960px) {
          .admin-grid { grid-template-columns: 1fr; }
          .side-panel { position: relative; top: 0; }
        }
      `}</style>

      <div className="top">
        <a href="/" className="brand">
          <span className="hue-dots"><span></span><span></span><span></span></span>
          SolarHues
        </a>
        <div className="pill-status" style={{ borderColor: '#EF4444', color: '#FCA5A5', background: 'rgba(239, 68, 68, 0.05)' }}>
          System Operations Command
        </div>
      </div>

      <div className="admin-container">
        <div className="kicker">Core System Metrics Hub</div>
        <h1 style={{ fontSize: '38px', fontFamily: "'Space Grotesk', sans-serif" }}>
          Marketplace <span className="hue">Lead Monitor</span>
        </h1>
        <p className="sub" style={{ marginTop: '8px', maxWidth: '600px' }}>
          Select an active customer row profile record block to audit localized deployment pipelines and check discom grid integration steps.
        </p>

        <div className="admin-grid">
          <div className="table-card">
            <table className="cust-table">
              <thead>
                <tr>
                  <th>Customer Profile</th>
                  <th>Contact Info</th>
                  <th>Location Zone</th>
                  <th>System Target</th>
                </tr>
              </thead>
              <tbody>
                {CUSTOMERS_DATA.map((customer) => (
                  <tr 
                    key={customer.id} 
                    onClick={() => setSelectedCustomer(customer)}
                    className={`cust-row ${selectedCustomer?.id === customer.id ? 'active-row' : ''}`}
                  >
                    <td>
                      <div style={{ fontWeight: '700', color: '#fff', fontSize: '15px', fontFamily: "'Space Grotesk', sans-serif" }}>{customer.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>Registered: {customer.signupDate}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '13.5px' }}>{customer.email}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: '500', color: '#fff' }}>{customer.pincode}</div>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>{customer.region}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: '600', color: 'var(--sun)' }}>{customer.systemRequirement}</div>
                      <div style={{ fontSize: '12px', color: 'var(--emerald)' }}>Value: {customer.estInvestment}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="side-panel">
            {selectedCustomer ? (
              <div>
                <div style={{ fontSize: '11px', color: '#94E4C2', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                  Pipeline Reference: {selectedCustomer.id}
                </div>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '24px', fontFamily: "'Space Grotesk', sans-serif", color: '#fff' }}>
                  {selectedCustomer.name}
                </h3>
                <p style={{ fontSize: '13.5px', color: '#CBD5E1', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '16px' }}>
                  Current Goal: {selectedCustomer.systemRequirement} matching regional pricing indexes.
                </p>

                <div>
                  {selectedCustomer.milestones.map((milestone) => (
                    <div className="m-card" key={milestone.step}>
                      <div className={`m-indicator status-${milestone.status}`}>
                        {milestone.status === 'completed' ? '✓' : milestone.step}
                      </div>
                      <div>
                        <div style={{ fontSize: '14.5px', fontWeight: '600', color: milestone.status === 'upcoming' ? '#64748B' : '#fff', fontFamily: "'Space Grotesk', sans-serif" }}>
                          {milestone.title}
                        </div>
                        <div style={{ fontSize: '11px', color: milestone.status === 'active' ? 'var(--sun)' : '#64748B', marginTop: '2px', fontWeight: '500' }}>

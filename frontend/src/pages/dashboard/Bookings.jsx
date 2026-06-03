import React, { useState } from 'react';
import { 
  Calendar, Plus, Search, Dumbbell, Scissors, 
  Stethoscope, Clock, ShieldCheck, CheckCircle2 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Bookings = () => {
  const { businessType, isSuperAdmin } = useAuth();
  const [filter, setFilter] = useState('all');

  const accentClass = isSuperAdmin ? 'admin' : businessType;

  // --- Dynamic Bookings scheduler logs based on businessType ---
  const getBookingsData = () => {
    if (isSuperAdmin) {
      return [
        { id: 'b1', action: 'Tenant Backup Completed', time: '10:00 AM', status: 'Success', operator: 'Cron Service', module: 'System Cloud' },
        { id: 'b2', action: 'MRR Ledger Refreshed', time: '12:00 PM', status: 'Success', operator: 'Stripe Hook', module: 'Revenue Core' },
        { id: 'b3', action: 'Daily Gate Cron Cleared', time: '06:00 AM', status: 'Success', operator: 'Database Job', module: 'Gym Gate API' },
      ];
    }

    switch (businessType) {
      case 'gym':
        return [
          { id: 'b1', athlete: 'Mike Ross', class: 'Power Crossfit Challenge', time: '06:00 AM', trainer: 'John Carter', status: 'Checked In' },
          { id: 'b2', athlete: 'Harvey Specter', class: 'Strength Hypertrophy Lift', time: '05:30 PM', trainer: 'Dave Batista', status: 'Booked' },
          { id: 'b3', athlete: 'Louis Litt', class: 'Zumba Aerobic Cardio', time: '09:00 AM', trainer: 'Sarah Miller', status: 'Absent' },
        ];
      case 'salon':
        return [
          { id: 'b1', customer: 'Jane Smith', stylist: 'Rachel Green', service: 'Balayage Hair Coloring', time: '02:00 PM', status: 'Confirmed' },
          { id: 'b2', customer: 'Lisa Cuddy', stylist: 'Chloe Vane', service: 'Gel Nail Polish Manicure', time: '03:30 PM', status: 'Pending' },
          { id: 'b3', customer: 'Monica Geller', stylist: 'Rachel Green', service: 'Facial & Skin Hydration', time: '05:00 PM', status: 'Confirmed' },
        ];
      case 'clinic':
        return [
          { id: 'b1', patient: 'John Doe', doctor: 'Dr. Marcus Vance', consult: 'Dental Surgery Consultation', time: '10:00 AM', status: 'In Cabin' },
          { id: 'b2', patient: 'Arthur Pendragon', doctor: 'Dr. Gaius', consult: 'Sports Physiotherapy Session', time: '11:15 AM', status: 'Completed' },
          { id: 'b3', patient: 'Ginevra Weasley', doctor: 'Dr. Pomfrey', consult: 'Annual Comprehensive checkup', time: '01:00 PM', status: 'Pending' },
        ];
      default:
        return [];
    }
  };

  const records = getBookingsData();

  const getPageHeaders = () => {
    if (isSuperAdmin) return { title: 'System Operations Logs', desc: 'Monitor background crons, automated backups, and billing triggers.' };
    switch (businessType) {
      case 'gym': return { title: 'Gym Class Schedules', desc: 'Track workout slots, attending athletes, and trainer sheets.' };
      case 'salon': return { title: 'Salon Appointment Books', desc: 'Track stylist occupancy, beauty bookings, and SMS confirmations.' };
      case 'clinic': return { title: 'Clinic Doctor Rota & Appointments', desc: 'Coordinate clinical patient queues, doctor check-ins, and consultation status.' };
      default: return { title: 'Reservations Scheduler', desc: 'Manage branch booking books.' };
    }
  };

  const headers = getPageHeaders();

  return (
    <div className="bookings-page animate-fade">
      {/* Page Header */}
      <div className="page-title-row">
        <div>
          <h1>{headers.title}</h1>
          <p>{headers.desc}</p>
        </div>
        <button className={`btn btn-primary btn-${accentClass}`}>
          <Plus size={16} />
          <span>{isSuperAdmin ? 'Trigger Job' : 'Create Booking'}</span>
        </button>
      </div>

      {/* Filter tabs */}
      <div className="filter-card glass">
        <div className="filter-btns-row">
          <button className={`filter-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All Entries</button>
          <button className={`filter-tab ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>Pending / Inactive</button>
          <button className={`filter-tab ${filter === 'completed' ? 'active' : ''}`} onClick={() => setFilter('completed')}>Completed / Checked In</button>
        </div>
      </div>

      {/* Roster sheet table */}
      <div className="card-table-wrapper glass">
        <div className="table-header">
          <h3>Operational Roster Calendar</h3>
          <span className={`table-badge badge-${accentClass}`}>Time logs</span>
        </div>
        <div className="responsive-table">
          <table>
            <thead>
              {isSuperAdmin ? (
                <tr>
                  <th>Audit Trigger</th>
                  <th>Execution Hour</th>
                  <th>Assigned Module</th>
                  <th>Triggering Agent</th>
                  <th>System Status</th>
                </tr>
              ) : businessType === 'gym' ? (
                <tr>
                  <th>Attending Athlete</th>
                  <th>Workout Session</th>
                  <th>Class Rota Hour</th>
                  <th>Assigned Trainer</th>
                  <th>Check-in Status</th>
                </tr>
              ) : businessType === 'salon' ? (
                <tr>
                  <th>Client Customer</th>
                  <th>Beauty Service</th>
                  <th>Booking Hour</th>
                  <th>Attending Stylist</th>
                  <th>Confirmation Badge</th>
                </tr>
              ) : (
                <tr>
                  <th>Patient Name</th>
                  <th>Consultation Niche</th>
                  <th>Shift Hour</th>
                  <th>Attending Doctor</th>
                  <th>Clinic Status</th>
                </tr>
              )}
            </thead>
            <tbody>
              {records.map(r => (
                <tr key={r.id}>
                  {isSuperAdmin ? (
                    <>
                      <td><strong>{r.action}</strong></td>
                      <td>{r.time}</td>
                      <td>{r.module}</td>
                      <td>{r.operator}</td>
                      <td><span className="badge active">{r.status}</span></td>
                    </>
                  ) : businessType === 'gym' ? (
                    <>
                      <td><strong>{r.athlete}</strong></td>
                      <td>{r.class}</td>
                      <td>{r.time}</td>
                      <td>{r.trainer}</td>
                      <td>
                        <span className={`badge ${r.status === 'Checked In' ? 'active' : r.status === 'Booked' ? 'inprogress' : 'pending'}`}>
                          {r.status}
                        </span>
                      </td>
                    </>
                  ) : businessType === 'salon' ? (
                    <>
                      <td><strong>{r.customer}</strong></td>
                      <td>{r.service}</td>
                      <td>{r.time}</td>
                      <td>{r.stylist}</td>
                      <td>
                        <span className={`badge ${r.status === 'Confirmed' ? 'active' : 'pending'}`}>
                          {r.status}
                        </span>
                      </td>
                    </>
                  ) : (
                    <>
                      <td><strong>{r.patient}</strong></td>
                      <td>{r.consult}</td>
                      <td>{r.time}</td>
                      <td>{r.doctor}</td>
                      <td>
                        <span className={`badge ${r.status === 'Completed' ? 'active' : r.status === 'In Cabin' ? 'inprogress' : 'pending'}`}>
                          {r.status}
                        </span>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Embedded CSS */}
      <style>{`
        .bookings-page {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        
        .page-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid hsla(var(--border-frosted));
          padding-bottom: 24px;
        }
        .page-title-row h1 { font-size: 2rem; color: hsla(var(--text-main)); }
        .page-title-row p { color: hsla(var(--text-body)); }
        
        /* Filter Card */
        .filter-card {
          border-radius: var(--radius-md);
          padding: 12px 20px;
          box-shadow: var(--shadow-sm);
        }
        .filter-btns-row {
          display: flex;
          gap: 12px;
        }
        .filter-tab {
          border: none;
          background: transparent;
          cursor: pointer;
          font-family: var(--font-sans);
          font-weight: 700;
          font-size: 0.88rem;
          padding: 8px 16px;
          border-radius: var(--radius-sm);
          color: hsla(var(--text-body));
          transition: all var(--transition-fast);
        }
        .filter-tab.active {
          background-color: hsla(var(--text-muted), 0.1);
          color: hsla(var(--text-main));
        }
        
        .btn-gym { background-color: hsla(var(--accent-gym)); color: white; }
        .btn-gym:hover { background-color: hsla(var(--accent-gym), 0.9); }
        .btn-salon { background-color: hsla(var(--accent-salon)); color: white; }
        .btn-salon:hover { background-color: hsla(var(--accent-salon), 0.9); }
        .btn-clinic { background-color: hsla(var(--accent-clinic)); color: white; }
        .btn-clinic:hover { background-color: hsla(var(--accent-clinic), 0.9); }
        
        .badge-gym { background-color: hsla(var(--accent-gym), 0.1); color: hsla(var(--accent-gym)); }
        .badge-salon { background-color: hsla(var(--accent-salon), 0.1); color: hsla(var(--accent-salon)); }
        .badge-clinic { background-color: hsla(var(--accent-clinic), 0.1); color: hsla(var(--accent-clinic)); }
        .badge-admin { background-color: hsla(var(--primary), 0.1); color: hsla(var(--primary)); }
        
        @media (max-width: 600px) {
          .page-title-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
          .page-title-row button {
            width: 100%;
          }
          .filter-btns-row {
            flex-direction: column;
            width: 100%;
          }
          .filter-tab {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default Bookings;

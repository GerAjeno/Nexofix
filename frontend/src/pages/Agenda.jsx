import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { ticketsService } from '../services/ticketsService';
import TicketDetailModal from '../components/TicketDetailModal';

export default function Agenda() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  // Opciones para Month/Year selectors
  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  
  const years = [];
  const currentYear = new Date().getFullYear();
  for (let y = currentYear - 2; y <= currentYear + 2; y++) {
    years.push(y);
  }

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setIsLoading(true);
      const data = await ticketsService.getAll();
      setTickets(data);
    } catch (err) {
      console.error("Error al cargar tickets para agenda:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => {
    let day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Ajustar para que Lunes sea 0
  };

  const renderCells = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    // Días del mes anterior para completar la primera fila
    const prevMonthDays = getDaysInMonth(year, month - 1);
    const cells = [];

    // Celdas mes anterior
    for (let i = firstDay - 1; i >= 0; i--) {
      cells.push({ day: prevMonthDays - i, currentMonth: false });
    }

    // Celdas mes actual
    const today = new Date();
    for (let d = 1; d <= daysInMonth; d++) {
      const isToday = today.getDate() === d && today.getMonth() === month && today.getFullYear() === year;
      
      // Filtrar tickets para este día específico
      const dateStr = `${String(d).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}`;
      const dayTickets = tickets.filter(t => t.fecha_agendada === dateStr);
      
      cells.push({ day: d, currentMonth: true, isToday, tickets: dayTickets });
    }

    // Celdas mes siguiente para completar la grilla
    const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
    const nextDays = totalCells - cells.length;
    for (let n = 1; n <= nextDays; n++) {
      cells.push({ day: n, currentMonth: false });
    }

    return cells;
  };

  const handleMonthChange = (e) => {
    const newDate = new Date(currentDate.setMonth(parseInt(e.target.value)));
    setCurrentDate(new Date(newDate));
  };

  const handleYearChange = (e) => {
    const newDate = new Date(currentDate.setFullYear(parseInt(e.target.value)));
    setCurrentDate(new Date(newDate));
  };

  const daysOfWeek = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  return (
    <div className="agenda-container">
      <div className="header-actions">
        <div>
          <h2 className="page-title">Agenda de Trabajo</h2>
          <p className="page-subtitle">Planificación mensual de ejecuciones técnicas</p>
        </div>
      </div>

      <div className="calendar-filters">
        <CalendarIcon size={20} style={{ color: 'var(--primary)', marginRight: '8px' }} />
        
        <select 
          className="form-control" 
          style={{ width: 'auto' }}
          value={currentDate.getMonth()}
          onChange={handleMonthChange}
        >
          {months.map((m, idx) => (
            <option key={idx} value={idx}>{m}</option>
          ))}
        </select>

        <select 
          className="form-control" 
          style={{ width: 'auto' }}
          value={currentDate.getFullYear()}
          onChange={handleYearChange}
        >
          {years.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
          <button 
            className="icon-btn" 
            onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            className="icon-btn" 
            onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="calendar-grid">
        {daysOfWeek.map(d => (
          <div key={d} className="calendar-day-head">{d}</div>
        ))}

        {renderCells().map((cell, idx) => (
          <div 
            key={idx} 
            className={`calendar-cell ${!cell.currentMonth ? 'other-month' : ''} ${cell.isToday ? 'today' : ''}`}
          >
            <div className="day-number">{cell.day}</div>
            <div className="calendar-events">
              {cell.tickets?.map(ticket => (
                <div 
                  key={ticket.id} 
                  className={`calendar-event-badge ${ticket.jornada?.toLowerCase().replace(' ', '-')}`}
                  title={`${ticket.numero_ticket} - ${ticket.cliente_nombre}`}
                  onClick={() => { setSelectedTicketId(ticket.id); setShowDetail(true); }}
                  style={{ cursor: 'pointer' }}
                >
                  <strong>{ticket.jornada === 'Mañana' ? 'AM' : 'PM'}:</strong> {ticket.cliente_nombre}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showDetail && selectedTicketId && (
        <TicketDetailModal 
          ticketId={selectedTicketId} 
          onClose={() => { setShowDetail(false); setSelectedTicketId(null); }} 
        />
      )}
    </div>
  );
}

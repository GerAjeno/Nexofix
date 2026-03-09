import { useState, useEffect } from 'react';
import { Settings, Building2, MonitorCog, Users, Calendar, Banknote, ShieldAlert, UploadCloud, Save, CheckCircle2 } from 'lucide-react';
import { getAjustesGenerales, updateAjustesGenerales, uploadLogo } from '../services/ajustesService';

export default function Ajustes() {
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');

  // Estados Formulario General
  const [generalData, setGeneralData] = useState({
    empresa_nombre: '',
    empresa_logo: '',
    empresa_direccion: '',
    empresa_telefono: '',
    banco_rut: '',
    banco_nombre_titular: '',
    banco_email: '',
    banco_nombre: '',
    banco_tipo_cuenta: 'Cuenta Corriente',
    banco_numero_cuenta: '',
    idioma: 'Español Latino',
    impuesto_boleta: 15.25,
    impuesto_iva: 19.00
  });

  const [previewLogo, setPreviewLogo] = useState(null);

  useEffect(() => {
    loadAjustes();
  }, []);

  const loadAjustes = async () => {
    try {
      setIsLoading(true);
      const data = await getAjustesGenerales();
      setGeneralData({
        empresa_nombre: data.empresa_nombre || '',
        empresa_logo: data.empresa_logo || '',
        empresa_direccion: data.empresa_direccion || '',
        empresa_telefono: data.empresa_telefono || '',
        banco_rut: data.banco_rut || '',
        banco_nombre_titular: data.banco_nombre_titular || '',
        banco_email: data.banco_email || '',
        banco_nombre: data.banco_nombre || '',
        banco_tipo_cuenta: data.banco_tipo_cuenta || 'Cuenta Corriente',
        banco_numero_cuenta: data.banco_numero_cuenta || '',
        idioma: data.idioma || 'Español Latino',
        impuesto_boleta: data.impuesto_boleta || 15.25,
        impuesto_iva: data.impuesto_iva || 19.00
      });
      setPreviewLogo(data.empresa_logo && data.empresa_logo !== '/logo.png' 
        ? `http://localhost:3000${data.empresa_logo}` 
        : null
      );
    } catch (err) {
      setError('No se pudieron cargar los ajustes.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setGeneralData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPreviewLogo(URL.createObjectURL(file));
      
      try {
        const uploadRes = await uploadLogo(file);
        setGeneralData(prev => ({ ...prev, empresa_logo: uploadRes.path }));
      } catch (err) {
        setError('Error al subir la imagen. Asegúrese de arrancar el servidor web.');
        console.error(err);
      }
    }
  };

  const handleSaveGeneral = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setError('');
      await updateAjustesGenerales(generalData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000); // Ocultar mensaje de éxito
    } catch (err) {
      setError('Error al guardar los ajustes.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="card"><div className="loading-spinner"></div></div>;

  return (
    <div className="card ajustes-container" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ display: 'flex', flexDirection: window.innerWidth > 768 ? 'row' : 'column', minHeight: '80vh' }}>
        
        {/* Sidebar de Menú Interno de Ajustes */}
        <div style={{ 
          width: window.innerWidth > 768 ? '250px' : '100%', 
          backgroundColor: 'var(--bg-card)', 
          borderRight: window.innerWidth > 768 ? '1px solid var(--border-color)' : 'none',
          borderBottom: window.innerWidth <= 768 ? '1px solid var(--border-color)' : 'none',
          padding: '1.5rem 0'
        }}>
          <h2 style={{ padding: '0 1.5rem', marginBottom: '1.5rem', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={22} className="text-primary" /> Ajustes
          </h2>
          
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <button 
              className={`ajustes-tab ${activeTab === 'general' ? 'active' : ''}`}
              onClick={() => setActiveTab('general')}
              style={{ padding: '12px 1.5rem', display: 'flex', alignItems: 'center', gap: '10px', background: activeTab === 'general' ? 'rgba(52, 152, 219, 0.1)' : 'transparent', borderLeft: activeTab === 'general' ? '3px solid var(--primary-color)' : '3px solid transparent', color: activeTab === 'general' ? 'var(--primary-color)' : 'var(--text-color)', textAlign: 'left', border: 'none', cursor: 'pointer', transition: 'all 0.2s', width: '100%', fontWeight: activeTab === 'general' ? 'bold': 'normal' }}
            >
              <Building2 size={18} /> General
            </button>
            <button className="ajustes-tab" onClick={() => alert("Próximamente esta sección.")} style={{ padding: '12px 1.5rem', display: 'flex', alignItems: 'center', gap: '10px', background: 'transparent', borderLeft: '3px solid transparent', color: 'var(--text-muted)', textAlign: 'left', border: 'none', cursor: 'pointer', opacity: 0.6, width: '100%' }}>
              <Users size={18} /> Clientes
            </button>
            <button className="ajustes-tab" onClick={() => alert("Próximamente esta sección.")} style={{ padding: '12px 1.5rem', display: 'flex', alignItems: 'center', gap: '10px', background: 'transparent', borderLeft: '3px solid transparent', color: 'var(--text-muted)', textAlign: 'left', border: 'none', cursor: 'pointer', opacity: 0.6, width: '100%' }}>
              <MonitorCog size={18} /> Sistema
            </button>
            <button className="ajustes-tab" onClick={() => alert("Próximamente esta sección.")} style={{ padding: '12px 1.5rem', display: 'flex', alignItems: 'center', gap: '10px', background: 'transparent', borderLeft: '3px solid transparent', color: 'var(--text-muted)', textAlign: 'left', border: 'none', cursor: 'pointer', opacity: 0.6, width: '100%' }}>
              <Calendar size={18} /> Agenda
            </button>
          </nav>
        </div>

        {/* Panel de Edición Central */}
        <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          
          {error && <div className="error-message" style={{ marginBottom: '1rem', padding: '12px', backgroundColor: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c', borderRadius: '8px', border: '1px solid rgba(231, 76, 60, 0.3)', display: 'flex', alignItems: 'center', gap: '8px' }}><ShieldAlert size={18} /> {error}</div>}
          
          {saveSuccess && <div style={{ marginBottom: '1rem', padding: '12px', backgroundColor: 'rgba(46, 204, 113, 0.1)', color: '#2ecc71', borderRadius: '8px', border: '1px solid rgba(46, 204, 113, 0.3)', display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={18} /> Cambios guardados y aplicados correctamente en la base de datos central.</div>}

          {activeTab === 'general' && (
            <div className="tab-pane active fade-in" style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Ajustes Generales</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Información de la empresa, cuentas bancarias e impuestos.</p>
                </div>
                <button 
                  onClick={handleSaveGeneral}
                  disabled={isSaving}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  {isSaving ? <div className="loading-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px', borderColor: '#fff', borderTopColor: 'transparent' }}></div> : <Save size={18} />} 
                  {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 1024 ? '1fr 1fr' : '1fr', gap: '2rem' }}>
                
                {/* IDENTIDAD DE LA EMPRESA */}
                <div style={{ backgroundColor: 'var(--bg-main)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem', color: 'var(--primary-color)' }}>
                    <Building2 size={20} /> Identidad de la Empresa
                  </h4>
                  
                  <div className="form-group">
                    <label>Nombre Comercial / Razón Social</label>
                    <input type="text" className="form-control" name="empresa_nombre" value={generalData.empresa_nombre} onChange={handleChange} placeholder="Ej. NexoFix SpA" />
                  </div>

                  <div className="form-group">
                    <label>Logo de la Empresa (Resolución Máxima: 2MB)</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                      <div style={{ width: '80px', height: '80px', backgroundColor: 'var(--bg-card)', borderRadius: '8px', border: '1px dashed var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {previewLogo ? <img src={previewLogo} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} /> : <Building2 size={32} color="var(--text-muted)" />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <input type="file" id="logoUpload" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                        <label htmlFor="logoUpload" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <UploadCloud size={18} /> {previewLogo ? 'Reemplazar Logo' : 'Cargar Logo'}
                        </label>
                        <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Las facturas consolidarán este logo visual.</p>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Dirección Principal Operativa</label>
                    <input type="text" className="form-control" name="empresa_direccion" value={generalData.empresa_direccion} onChange={handleChange} placeholder="Ej. Av. Providencia 1234, Of 5" />
                  </div>

                  <div className="form-group">
                    <label>Teléfono Oficial de Contacto</label>
                    <input type="text" className="form-control" name="empresa_telefono" value={generalData.empresa_telefono} onChange={handleChange} placeholder="Ej. +56 9 1234 5678" />
                  </div>
                </div>

                {/* TRANSFERENCIAS BANCARIAS */}
                <div style={{ backgroundColor: 'var(--bg-main)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem', color: 'var(--success-color)' }}>
                    <Banknote size={20} /> Datos de Transferencia Bancaria
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Esta información aparecerá impresa para sus clientes en Cotizaciones y Recibos PDF.</p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label>Banco Emisor</label>
                      <input type="text" className="form-control" name="banco_nombre" value={generalData.banco_nombre} onChange={handleChange} placeholder="Ej. Banco Estado" />
                    </div>
                    
                    <div className="form-group">
                      <label>Tipo de Cuenta</label>
                      <select className="form-control" name="banco_tipo_cuenta" value={generalData.banco_tipo_cuenta} onChange={handleChange}>
                        <option value="Cuenta Corriente">Cuenta Corriente</option>
                        <option value="Cuenta Vista">Cuenta Vista</option>
                        <option value="Cuenta de Ahorro">Cuenta de Ahorro</option>
                        <option value="Cuenta RUT">Cuenta RUT</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Número de Cuenta Comercial</label>
                    <input type="text" className="form-control" name="banco_numero_cuenta" value={generalData.banco_numero_cuenta} onChange={handleChange} placeholder="Ej. 123456789" />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label>RUT del Titular de Deuda</label>
                      <input type="text" className="form-control" name="banco_rut" value={generalData.banco_rut} onChange={handleChange} placeholder="Ej. 76.123.456-7" />
                    </div>
                    <div className="form-group">
                      <label>Nombre del Titular Legal</label>
                      <input type="text" className="form-control" name="banco_nombre_titular" value={generalData.banco_nombre_titular} onChange={handleChange} placeholder="Razón social o persona" />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Correo Electrónico Contable</label>
                    <input type="email" className="form-control" name="banco_email" value={generalData.banco_email} onChange={handleChange} placeholder="Ej. pagos@empresa.com" />
                  </div>
                </div>

                {/* FISCALIDAD Y LOCALIZACIÓN */}
                <div style={{ backgroundColor: 'var(--bg-main)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', gridColumn: window.innerWidth > 1024 ? 'span 2' : 'auto' }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem', color: 'var(--warning-color)' }}>
                    <MonitorCog size={20} /> Fiscalidad y Localización Regional
                  </h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 768 ? '1fr 1fr 1fr' : '1fr', gap: '1.5rem' }}>
                    <div className="form-group">
                      <label>Idioma por Defecto UI</label>
                      <select className="form-control" name="idioma" value={generalData.idioma} onChange={handleChange}>
                        <option value="Español Latino">Español Latino (CL, AR, MX)</option>
                        <option value="Inglés">Inglés (US)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Retención Boleta Honorarios (%)</label>
                      <div style={{ position: 'relative' }}>
                        <input type="number" step="0.01" className="form-control" name="impuesto_boleta" value={generalData.impuesto_boleta} onChange={handleChange} style={{ paddingRight: '2rem' }} />
                        <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>%</span>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Impuesto al Valor Agregado - IVA (%)</label>
                      <div style={{ position: 'relative' }}>
                        <input type="number" step="0.01" className="form-control" name="impuesto_iva" value={generalData.impuesto_iva} onChange={handleChange} style={{ paddingRight: '2rem' }} />
                        <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>%</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

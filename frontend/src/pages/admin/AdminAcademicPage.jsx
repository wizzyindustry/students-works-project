import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Layers, 
  GraduationCap, 
  BookOpen, 
  Plus, 
  Trash2, 
  Building,
  CheckCircle2
} from 'lucide-react';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Modal } from '../../components/common/Modal.jsx';

export function AdminAcademicPage() {
  const [activeTab, setActiveTab] = useState('universities'); // universities | colleges | programs | courses
  const [universities, setUniversities] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [modalType, setModalType] = useState(null); // 'university' | 'college' | 'program' | 'course'
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  const toast = useToast();

  useEffect(() => {
    loadHierarchy();
  }, []);

  const loadHierarchy = async () => {
    setLoading(true);
    try {
      const res = await api.getHierarchy();
      const unis = res.hierarchy || [];
      setUniversities(unis);

      const allColleges = [];
      const allPrograms = [];
      const allCourses = [];

      unis.forEach(u => {
        (u.colleges || []).forEach(c => {
          allColleges.push({ ...c, universityName: u.name, universityId: u.id });
          (c.programs || []).forEach(p => {
            allPrograms.push({ ...p, collegeName: c.name, collegeId: c.id, universityName: u.name });
            (p.courses || []).forEach(crs => {
              allCourses.push({ ...crs, programName: p.name, programId: p.id });
            });
          });
        });
      });

      setColleges(allColleges);
      setPrograms(allPrograms);
      setCourses(allCourses);
    } catch {
      toast.error('Failed to load academic structure');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modalType === 'university') {
        await api.createUniversity({
          name: formData.name,
          code: formData.code.toUpperCase(),
          description: formData.description
        });
        toast.success('University added successfully');
      } else if (modalType === 'college') {
        await api.createCollege({
          universityId: formData.universityId || universities[0]?.id,
          name: formData.name,
          code: formData.code.toUpperCase(),
          description: formData.description
        });
        toast.success('College added successfully');
      } else if (modalType === 'program') {
        await api.createProgram({
          collegeId: formData.collegeId || colleges[0]?.id,
          name: formData.name,
          code: formData.code.toUpperCase(),
          durationYears: Number(formData.durationYears || 3)
        });
        toast.success('Degree program added successfully');
      } else if (modalType === 'course') {
        await api.createCourse({
          programId: formData.programId || programs[0]?.id,
          name: formData.name,
          code: formData.code.toUpperCase(),
          year: Number(formData.year || 1),
          semester: Number(formData.semester || 1),
          credits: Number(formData.credits || 10)
        });
        toast.success('Course added successfully');
      }
      setModalType(null);
      setFormData({});
      loadHierarchy();
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.35rem' }}>Academic Hierarchy Structure</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem' }}>
            Manage the classification tree: University &rarr; College &rarr; Degree Program &rarr; Course
          </p>
        </div>

        <button 
          onClick={() => {
            if (activeTab === 'universities') setModalType('university');
            if (activeTab === 'colleges') setModalType('college');
            if (activeTab === 'programs') setModalType('program');
            if (activeTab === 'courses') setModalType('course');
            setFormData({});
          }}
          className="btn btn-primary btn-sm"
          style={{ gap: '6px' }}
        >
          <Plus size={16} /> 
          <span>Add {activeTab.slice(0, -1)}</span>
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { label: `Universities (${universities.length})`, value: 'universities', icon: Building },
          { label: `Colleges / Schools (${colleges.length})`, value: 'colleges', icon: Layers },
          { label: `Programs (${programs.length})`, value: 'programs', icon: GraduationCap },
          { label: `Courses (${courses.length})`, value: 'courses', icon: BookOpen }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={activeTab === tab.value ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
              style={{ gap: '6px' }}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div className="spinner-border text-primary" role="status" style={{ width: '36px', height: '36px' }} />
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading academic data...</p>
        </div>
      ) : (
        <>
          {activeTab === 'universities' && (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>University Name</th>
                    <th>Code</th>
                    <th>Description</th>
                    <th>Colleges Count</th>
                  </tr>
                </thead>
                <tbody>
                  {universities.map(u => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 600 }}>{u.name}</td>
                      <td><span className="badge badge-primary">{u.code}</span></td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{u.description || 'Public University'}</td>
                      <td>{u.colleges?.length || 0} colleges</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'colleges' && (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>College / Faculty Name</th>
                    <th>Code</th>
                    <th>University</th>
                    <th>Programs Count</th>
                  </tr>
                </thead>
                <tbody>
                  {colleges.map(c => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600 }}>{c.name}</td>
                      <td><span className="badge badge-primary">{c.code}</span></td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{c.universityName}</td>
                      <td>{c.programs?.length || 0} programs</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'programs' && (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Degree Program</th>
                    <th>Code</th>
                    <th>College</th>
                    <th>Duration</th>
                    <th>Courses Count</th>
                  </tr>
                </thead>
                <tbody>
                  {programs.map(p => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600 }}>{p.name}</td>
                      <td><span className="badge badge-primary">{p.code}</span></td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{p.collegeName}</td>
                      <td style={{ fontSize: '0.85rem' }}>{p.durationYears || 3} Years</td>
                      <td>{p.courses?.length || 0} courses</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'courses' && (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Course Code</th>
                    <th>Course Name</th>
                    <th>Degree Program</th>
                    <th>Year &amp; Semester</th>
                    <th>Credits</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map(crs => (
                    <tr key={crs.id}>
                      <td><span className="badge badge-primary">{crs.code}</span></td>
                      <td style={{ fontWeight: 600 }}>{crs.name}</td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{crs.programName}</td>
                      <td style={{ fontSize: '0.85rem' }}>Year {crs.year} • Sem {crs.semester}</td>
                      <td>{crs.credits || 10}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Dynamic Creation Modal */}
      <Modal
        isOpen={!!modalType}
        onClose={() => setModalType(null)}
        title={`Add New ${modalType ? modalType.charAt(0).toUpperCase() + modalType.slice(1) : ''}`}
      >
        <form onSubmit={handleCreate}>
          {modalType === 'university' && (
            <>
              <div className="form-group">
                <label className="form-label">University Name</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Sokoine University of Agriculture"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Acronym Code</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. SUA"
                  value={formData.code || ''}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </>
          )}

          {modalType === 'college' && (
            <>
              <div className="form-group">
                <label className="form-label">Affiliated University</label>
                <select
                  className="form-select"
                  value={formData.universityId || universities[0]?.id}
                  onChange={(e) => setFormData({ ...formData, universityId: e.target.value })}
                >
                  {universities.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">College / School Name</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. School of Business and Economics"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">College Code</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. SOBE"
                  value={formData.code || ''}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
              </div>
            </>
          )}

          {modalType === 'program' && (
            <>
              <div className="form-group">
                <label className="form-label">College / School</label>
                <select
                  className="form-select"
                  value={formData.collegeId || colleges[0]?.id}
                  onChange={(e) => setFormData({ ...formData, collegeId: e.target.value })}
                >
                  {colleges.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.universityName})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Degree Program Name</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. BSc in Cybersecurity and Digital Forensics"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Program Code</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. BCDF"
                    value={formData.code || ''}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Duration (Years)</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    className="form-input"
                    value={formData.durationYears || '3'}
                    onChange={(e) => setFormData({ ...formData, durationYears: e.target.value })}
                  />
                </div>
              </div>
            </>
          )}

          {modalType === 'course' && (
            <>
              <div className="form-group">
                <label className="form-label">Program</label>
                <select
                  className="form-select"
                  value={formData.programId || programs[0]?.id}
                  onChange={(e) => setFormData({ ...formData, programId: e.target.value })}
                >
                  {programs.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.collegeName})</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Course Code</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. CS211"
                    value={formData.code || ''}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Course Title</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Operating Systems"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Year</label>
                  <select
                    className="form-select"
                    value={formData.year || '1'}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  >
                    <option value="1">Year 1</option>
                    <option value="2">Year 2</option>
                    <option value="3">Year 3</option>
                    <option value="4">Year 4</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Semester</label>
                  <select
                    className="form-select"
                    value={formData.semester || '1'}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  >
                    <option value="1">Semester 1</option>
                    <option value="2">Semester 2</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Credits</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.credits || '10'}
                    onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                  />
                </div>
              </div>
            </>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setModalType(null)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? 'Saving...' : 'Add Item'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  UploadCloud, 
  FileText, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import confetti from 'canvas-confetti';

export function UploadPage() {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseId, setCourseId] = useState('');
  const [materialTypeId, setMaterialTypeId] = useState('');
  const [academicYear, setAcademicYear] = useState('2024-2025');
  const [semester, setSemester] = useState('1');
  const [file, setFile] = useState(null);
  const [fileDragging, setFileDragging] = useState(false);

  const [courses, setCourses] = useState([]);
  const [materialTypes, setMaterialTypes] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const toast = useToast();
  const navigate = useNavigate();

  // Load courses and types
  useEffect(() => {
    async function loadFormData() {
      try {
        const [typesRes, hierRes] = await Promise.all([
          api.getMaterialTypes(),
          api.getHierarchy()
        ]);

        if (typesRes.types) {
          setMaterialTypes(typesRes.types);
          if (typesRes.types.length > 0 && !materialTypeId) {
            setMaterialTypeId(typesRes.types[0].id);
          }
        }

        // Flatten courses from hierarchy
        const courseList = [];
        if (hierRes.hierarchy) {
          hierRes.hierarchy.forEach(u => {
            u.colleges?.forEach(c => {
              c.programs?.forEach(p => {
                p.courses?.forEach(crs => {
                  courseList.push({
                    id: crs.id,
                    name: crs.name,
                    code: crs.code,
                    program: p.code || p.name
                  });
                });
              });
            });
          });
        }
        setCourses(courseList);
        if (courseList.length > 0 && !courseId) {
          setCourseId(courseList[0].id);
        }

        // If editing
        if (editId) {
          const matRes = await api.getMaterial(editId);
          if (matRes.material) {
            const m = matRes.material;
            setTitle(m.title || '');
            setDescription(m.description || '');
            if (m.course?.id) setCourseId(m.course.id);
            if (m.materialType?.id) setMaterialTypeId(m.materialType.id);
            if (m.academicYear) setAcademicYear(m.academicYear);
            if (m.semester) setSemester(String(m.semester));
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadFormData();
  }, [editId]);

  const handleFileDrop = (e) => {
    e.preventDefault();
    setFileDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (f) => {
    if (f.size > 52428800) { // 50MB
      toast.error('File size exceeds the 50MB limit.');
      return;
    }
    setFile(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a descriptive material title');
      return;
    }
    if (!courseId) {
      toast.error('Please select an associated course');
      return;
    }
    if (!editId && !file) {
      toast.error('Please select a file to upload');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('courseId', courseId);
      formData.append('materialTypeId', materialTypeId);
      formData.append('academicYear', academicYear);
      formData.append('semester', semester);
      if (file) {
        formData.append('file', file);
      }

      await api.uploadMaterial(formData);

      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 }
      });

      toast.success(editId ? 'Resource updated successfully!' : 'Resource uploaded and available for review!');
      navigate('/my-uploads');
    } catch (err) {
      toast.error(err.message || 'Failed to submit upload');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ padding: '6px 10px', gap: '6px' }}>
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <div className="glass-card" style={{ padding: '2.5rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.35rem' }}>
            {editId ? 'Edit Academic Material' : 'Upload Academic Material'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem' }}>
            Share high-quality notes, exam questions, or tutorials with fellow students
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* File Dropzone */}
          {!editId && (
            <div className="form-group">
              <label className="form-label">
                Document File <span style={{ color: 'var(--accent-rose)' }}>*</span>
              </label>

              {!file ? (
                <div
                  className={`file-dropzone ${fileDragging ? 'dragging' : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setFileDragging(true); }}
                  onDragLeave={() => setFileDragging(false)}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg,.zip"
                    style={{ display: 'none' }}
                  />
                  <div className="material-card-icon pulse-glow" style={{ margin: '0 auto 1rem', background: 'var(--primary-light)', color: 'var(--primary)', width: '56px', height: '56px' }}>
                    <UploadCloud size={30} />
                  </div>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>
                    Drag &amp; drop file here, or <span style={{ color: 'var(--primary)', textDecoration: 'underline' }}>browse</span>
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Supported formats: PDF, DOCX, PPTX, XLSX, Images, ZIP (Max 50MB)
                  </p>
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem 1.25rem',
                  background: 'var(--primary-light)',
                  border: '1.5px solid var(--primary)',
                  borderRadius: 'var(--radius-lg)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <FileText size={28} color="var(--primary)" />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                        {file.name}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--accent-rose)' }}
                    aria-label="Remove file"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="title">
              Resource Title <span style={{ color: 'var(--accent-rose)' }}>*</span>
            </label>
            <input
              id="title"
              type="text"
              required
              className="form-input"
              placeholder="e.g. CS211: Complete Data Structures Lecture Notes &amp; Graph Algorithms"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="description">
              Description &amp; Key Topics Covered
            </label>
            <textarea
              id="description"
              rows={4}
              className="form-textarea"
              placeholder="Include chapter numbers, instructor name, whether it contains worked solutions or sample codes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Course & Type Selection */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="course">
                Course <span style={{ color: 'var(--accent-rose)' }}>*</span>
              </label>
              <select
                id="course"
                className="form-select"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
              >
                {courses.map(c => (
                  <option key={c.id} value={c.id}>
                    [{c.code}] {c.name} ({c.program})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="materialType">
                Material Type
              </label>
              <select
                id="materialType"
                className="form-select"
                value={materialTypeId}
                onChange={(e) => setMaterialTypeId(e.target.value)}
              >
                {materialTypes.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Academic Year & Semester */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="academicYear">
                Academic Year
              </label>
              <select
                id="academicYear"
                className="form-select"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
              >
                <option value="2024-2025">2024-2025</option>
                <option value="2023-2024">2023-2024</option>
                <option value="2022-2023">2022-2023</option>
                <option value="2021-2022">2021-2022</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="semester">
                Semester
              </label>
              <select
                id="semester"
                className="form-select"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
              >
                <option value="1">Semester I</option>
                <option value="2">Semester II</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
            <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary" style={{ minWidth: '160px' }}>
              {submitting ? 'Submitting...' : editId ? 'Save Changes' : 'Upload Resource'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

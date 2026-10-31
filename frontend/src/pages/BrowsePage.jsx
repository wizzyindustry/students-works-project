import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Building, 
  Layers, 
  GraduationCap, 
  Calendar, 
  BookOpen, 
  ChevronRight, 
  Search, 
  ArrowLeft,
  Sparkles,
  FileText
} from 'lucide-react';
import { api } from '../services/api.js';

export function BrowsePage() {
  const [level, setLevel] = useState('universities'); // universities | colleges | programs | years | semesters | courses
  const [selectedPath, setSelectedPath] = useState({
    universityId: null,
    universityName: '',
    collegeId: null,
    collegeName: '',
    programId: null,
    programName: '',
    year: null,
    semester: null
  });

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadLevelData();
  }, [level, selectedPath.universityId, selectedPath.collegeId, selectedPath.programId, selectedPath.year, selectedPath.semester]);

  const loadLevelData = async () => {
    setLoading(true);
    try {
      if (level === 'universities') {
        const res = await api.getUniversities();
        setItems(res.universities || []);
      } else if (level === 'colleges') {
        const res = await api.getColleges(selectedPath.universityId);
        setItems(res.colleges || []);
      } else if (level === 'programs') {
        const res = await api.getPrograms(selectedPath.collegeId);
        setItems(res.programs || []);
      } else if (level === 'years') {
        setItems([
          { id: 1, name: 'Year 1 (Freshman)', sub: 'First Year Core Courses' },
          { id: 2, name: 'Year 2 (Sophomore)', sub: 'Intermediate Modules' },
          { id: 3, name: 'Year 3 (Junior)', sub: 'Advanced Specialization' },
          { id: 4, name: 'Year 4 (Senior)', sub: 'Capstone & Research' },
          { id: 5, name: 'Year 5 (Professional)', sub: 'Extended Professional Years' }
        ]);
      } else if (level === 'semesters') {
        setItems([
          { id: 1, name: 'Semester I', sub: 'Fall / Autumn Term' },
          { id: 2, name: 'Semester II', sub: 'Spring Term' }
        ]);
      } else if (level === 'courses') {
        const res = await api.getCoursesByYearSemester(selectedPath.programId, selectedPath.year, selectedPath.semester);
        setItems(res.courses || []);
      }
    } catch (err) {
      console.error(err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUniversity = (uni) => {
    setSelectedPath(prev => ({ ...prev, universityId: uni.id, universityName: uni.name }));
    setLevel('colleges');
  };

  const handleSelectCollege = (col) => {
    setSelectedPath(prev => ({ ...prev, collegeId: col.id, collegeName: col.name }));
    setLevel('programs');
  };

  const handleSelectProgram = (prg) => {
    setSelectedPath(prev => ({ ...prev, programId: prg.id, programName: prg.name }));
    setLevel('years');
  };

  const handleSelectYear = (yr) => {
    setSelectedPath(prev => ({ ...prev, year: yr.id }));
    setLevel('semesters');
  };

  const handleSelectSemester = (sem) => {
    setSelectedPath(prev => ({ ...prev, semester: sem.id }));
    setLevel('courses');
  };

  const handleSelectCourse = (course) => {
    navigate(`/search?courseId=${course.id}&courseName=${encodeURIComponent(course.name)}`);
  };

  const resetTo = (targetLevel) => {
    if (targetLevel === 'universities') {
      setSelectedPath({ universityId: null, universityName: '', collegeId: null, collegeName: '', programId: null, programName: '', year: null, semester: null });
      setLevel('universities');
    } else if (targetLevel === 'colleges') {
      setSelectedPath(prev => ({ ...prev, collegeId: null, collegeName: '', programId: null, programName: '', year: null, semester: null }));
      setLevel('colleges');
    } else if (targetLevel === 'programs') {
      setSelectedPath(prev => ({ ...prev, programId: null, programName: '', year: null, semester: null }));
      setLevel('programs');
    } else if (targetLevel === 'years') {
      setSelectedPath(prev => ({ ...prev, year: null, semester: null }));
      setLevel('years');
    } else if (targetLevel === 'semesters') {
      setSelectedPath(prev => ({ ...prev, semester: null }));
      setLevel('semesters');
    }
  };

  const getLevelTitle = () => {
    switch (level) {
      case 'universities': return 'Select University';
      case 'colleges': return `Colleges in ${selectedPath.universityName}`;
      case 'programs': return `Degree Programs in ${selectedPath.collegeName}`;
      case 'years': return `Select Year for ${selectedPath.programName}`;
      case 'semesters': return `Select Semester (Year ${selectedPath.year})`;
      case 'courses': return `Available Courses (Year ${selectedPath.year}, Semester ${selectedPath.semester})`;
      default: return 'Browse Hierarchy';
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
      {/* Header and Breadcrumbs */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
          <span 
            onClick={() => resetTo('universities')} 
            style={{ cursor: 'pointer', color: level === 'universities' ? 'var(--text-primary)' : 'var(--primary)', fontWeight: 600 }}
          >
            Universities
          </span>

          {selectedPath.universityId && (
            <>
              <ChevronRight size={14} />
              <span 
                onClick={() => resetTo('colleges')} 
                style={{ cursor: 'pointer', color: level === 'colleges' ? 'var(--text-primary)' : 'var(--primary)', fontWeight: 600 }}
              >
                {selectedPath.universityName}
              </span>
            </>
          )}

          {selectedPath.collegeId && (
            <>
              <ChevronRight size={14} />
              <span 
                onClick={() => resetTo('programs')} 
                style={{ cursor: 'pointer', color: level === 'programs' ? 'var(--text-primary)' : 'var(--primary)', fontWeight: 600 }}
              >
                {selectedPath.collegeName}
              </span>
            </>
          )}

          {selectedPath.programId && (
            <>
              <ChevronRight size={14} />
              <span 
                onClick={() => resetTo('years')} 
                style={{ cursor: 'pointer', color: level === 'years' ? 'var(--text-primary)' : 'var(--primary)', fontWeight: 600 }}
              >
                {selectedPath.programName}
              </span>
            </>
          )}

          {selectedPath.year && (
            <>
              <ChevronRight size={14} />
              <span 
                onClick={() => resetTo('semesters')} 
                style={{ cursor: 'pointer', color: level === 'semesters' ? 'var(--text-primary)' : 'var(--primary)', fontWeight: 600 }}
              >
                Year {selectedPath.year}
              </span>
            </>
          )}

          {selectedPath.semester && (
            <>
              <ChevronRight size={14} />
              <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                Semester {selectedPath.semester}
              </span>
            </>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.9rem', fontWeight: 800 }}>{getLevelTitle()}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem' }}>
              Navigate through the academic hierarchy to locate study materials and past tests
            </p>
          </div>

          {level !== 'universities' && (
            <button 
              onClick={() => {
                if (level === 'colleges') resetTo('universities');
                if (level === 'programs') resetTo('colleges');
                if (level === 'years') resetTo('programs');
                if (level === 'semesters') resetTo('years');
                if (level === 'courses') resetTo('semesters');
              }}
              className="btn btn-secondary btn-sm"
            >
              <ArrowLeft size={16} /> Back one level
            </button>
          )}
        </div>
      </div>

      {/* Grid of Items */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div className="spinner-border text-primary" role="status" style={{ width: '40px', height: '40px' }} />
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading academic structure...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <Layers size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3>No items found at this level</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
            There are currently no listed records for this selection.
          </p>
          <button onClick={() => resetTo('universities')} className="btn btn-primary">
            Start Over from Universities
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {items.map((item) => {
            let Icon = Building;
            if (level === 'colleges') Icon = Layers;
            if (level === 'programs') Icon = GraduationCap;
            if (level === 'years' || level === 'semesters') Icon = Calendar;
            if (level === 'courses') Icon = BookOpen;

            return (
              <div
                key={item.id}
                className="glass-card interactive"
                onClick={() => {
                  if (level === 'universities') handleSelectUniversity(item);
                  if (level === 'colleges') handleSelectCollege(item);
                  if (level === 'programs') handleSelectProgram(item);
                  if (level === 'years') handleSelectYear(item);
                  if (level === 'semesters') handleSelectSemester(item);
                  if (level === 'courses') handleSelectCourse(item);
                }}
                style={{ padding: '1.5rem', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div className="material-card-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                    <Icon size={22} />
                  </div>
                  <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                  {item.code ? `[${item.code}] ` : ''}{item.name}
                </h3>

                {item.description && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                    {item.description}
                  </p>
                )}

                {item.sub && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {item.sub}
                  </p>
                )}

                {level === 'courses' && (
                  <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Credits: {item.credits || 10}
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FileText size={14} /> View Materials
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

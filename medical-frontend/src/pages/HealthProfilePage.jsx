import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Activity,
  User,
  Heart,
  Pill,
  Clock,
  AlertTriangle,
  Target,
  CheckCircle,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Info,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export default function HealthProfilePage() {
  const { user, healthProfile, updateHealthProfileState } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    personalInfo: {
      name: user?.name || '',
      age: '',
      gender: '',
      height: '',
      weight: '',
      location: user?.address || '',
    },
    conditions: [],
    takingMedicinesCurrently: false,
    currentMedications: [],
    medicationRoutine: [],
    knownMedicineAllergies: false,
    allergies: [],
    allergyDetails: '',
    otherRestrictions: '',
    healthGoals: [],
    isCompleted: false,
  });

  // Temp state for adding a current medication
  const [tempMed, setTempMed] = useState({
    name: '',
    strength: '',
    type: 'Tablet',
    quantity: '1',
    frequency: 'Once daily',
    startDate: '',
    endDate: '',
  });

  // Temp state for adding a routine entry
  const [tempRoutine, setTempRoutine] = useState({
    medicine: '',
    time: '08:00 AM',
    quantity: '1 tablet',
    foodRelation: 'After food',
  });

  const conditionOptions = [
    'Diabetes',
    'High Blood Pressure',
    'Asthma',
    'Thyroid',
    'Heart Conditions',
    'Kidney-related conditions',
    'Allergies',
    'Other',
    'None',
    'Prefer not to say',
  ];

  const goalOptions = [
    'Medicine reminders',
    'Find nearby pharmacies',
    'Track orders',
    'Check medicine availability',
    'Maintain medication history',
    'Refill reminders',
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/health-profile');
        if (res.data.success && res.data.profile) {
          const p = res.data.profile;
          setFormData({
            personalInfo: {
              name: p.personalInfo?.name || user?.name || '',
              age: p.personalInfo?.age || '',
              gender: p.personalInfo?.gender || '',
              height: p.personalInfo?.height || '',
              weight: p.personalInfo?.weight || '',
              location: p.personalInfo?.location || user?.address || '',
            },
            conditions: p.conditions || [],
            takingMedicinesCurrently: Boolean(p.takingMedicinesCurrently),
            currentMedications: p.currentMedications || [],
            medicationRoutine: p.medicationRoutine || [],
            knownMedicineAllergies: Boolean(p.knownMedicineAllergies),
            allergies: p.allergies || [],
            allergyDetails: p.allergyDetails || '',
            otherRestrictions: p.otherRestrictions || '',
            healthGoals: p.healthGoals || [],
            isCompleted: p.isCompleted || false,
          });
        }
      } catch (err) {
        console.error('Error fetching health profile', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleConditionToggle = (cond) => {
    setFormData((prev) => {
      let updated = [...prev.conditions];
      if (cond === 'None' || cond === 'Prefer not to say') {
        updated = [cond];
      } else {
        updated = updated.filter((c) => c !== 'None' && c !== 'Prefer not to say');
        if (updated.includes(cond)) {
          updated = updated.filter((c) => c !== cond);
        } else {
          updated.push(cond);
        }
      }
      return { ...prev, conditions: updated };
    });
  };

  const handleGoalToggle = (goal) => {
    setFormData((prev) => {
      let updated = [...prev.healthGoals];
      if (updated.includes(goal)) {
        updated = updated.filter((g) => g !== goal);
      } else {
        updated.push(goal);
      }
      return { ...prev, healthGoals: updated };
    });
  };

  const addMedication = () => {
    if (!tempMed.name.trim()) {
      showToast('Please enter a medicine name', 'error');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      currentMedications: [...prev.currentMedications, { ...tempMed }],
    }));
    setTempMed({
      name: '',
      strength: '',
      type: 'Tablet',
      quantity: '1',
      frequency: 'Once daily',
      startDate: '',
      endDate: '',
    });
  };

  const removeMedication = (index) => {
    setFormData((prev) => ({
      ...prev,
      currentMedications: prev.currentMedications.filter((_, i) => i !== index),
    }));
  };

  const addRoutineItem = () => {
    if (!tempRoutine.medicine.trim()) {
      showToast('Please enter medicine name for routine', 'error');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      medicationRoutine: [...prev.medicationRoutine, { ...tempRoutine }],
    }));
    setTempRoutine({
      medicine: '',
      time: '08:00 AM',
      quantity: '1 tablet',
      foodRelation: 'After food',
    });
  };

  const removeRoutineItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      medicationRoutine: prev.medicationRoutine.filter((_, i) => i !== index),
    }));
  };

  const saveProfileToServer = async (completed = false) => {
    setSaving(true);
    try {
      const payload = {
        ...formData,
        isCompleted: completed || formData.isCompleted,
        completedSteps: currentStep,
      };

      const res = await api.put('/health-profile', payload);
      if (res.data.success) {
        updateHealthProfileState(res.data.profile);
        showToast(
          completed ? 'Health profile successfully completed and saved!' : 'Progress saved',
          'success'
        );
        if (completed) {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save health profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    await saveProfileToServer(false);
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Step 6 reached, finalize
      await saveProfileToServer(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <div style={{ color: 'var(--teal-600)', fontSize: '1.2rem', fontWeight: 600 }}>Loading health profile...</div>
      </div>
    );
  }

  const stepsList = [
    { num: 1, title: 'Personal Info', icon: User },
    { num: 2, title: 'Conditions', icon: Heart },
    { num: 3, title: 'Medications', icon: Pill },
    { num: 4, title: 'Routine Schedule', icon: Clock },
    { num: 5, title: 'Allergies', icon: AlertTriangle },
    { num: 6, title: 'Health Goals', icon: Target },
  ];

  return (
    <div style={{ padding: '2.5rem 1rem', minHeight: '85vh' }}>
      <div className="container" style={{ maxWidth: '840px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span className="badge badge-primary" style={{ marginBottom: '0.65rem' }}>
            Customer Health Onboarding
          </span>
          <h1 className="title-section" style={{ marginBottom: '0.4rem' }}>
            Your Personalized Health Profile
          </h1>
          <p style={{ color: 'var(--navy-600)', fontSize: '0.95rem' }}>
            Organize your medications, conditions, allergies, and daily routine in one secure dashboard.
          </p>
        </div>

        {/* Step Indicator Wizard Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--white)',
            borderRadius: 'var(--radius-xl)',
            padding: '1rem 1.5rem',
            border: '1px solid var(--slate-200)',
            boxShadow: 'var(--shadow-sm)',
            marginBottom: '2rem',
            overflowX: 'auto',
            gap: '0.5rem',
          }}
        >
          {stepsList.map((s) => {
            const Icon = s.icon;
            const isCurrent = currentStep === s.num;
            const isDone = currentStep > s.num;

            return (
              <div
                key={s.num}
                onClick={() => setCurrentStep(s.num)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  opacity: isCurrent ? 1 : isDone ? 0.9 : 0.5,
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: isDone ? 'var(--mint-500)' : isCurrent ? 'var(--teal-600)' : 'var(--slate-200)',
                    color: isDone || isCurrent ? 'var(--white)' : 'var(--navy-600)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                  }}
                >
                  {isDone ? <CheckCircle size={16} /> : s.num}
                </div>
                <div style={{ textAlign: 'left', display: 'none' }} className="step-label">
                  <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)', textTransform: 'uppercase' }}>Step {s.num}</div>
                  <div style={{ fontSize: '0.825rem', fontWeight: isCurrent ? 700 : 500, color: 'var(--navy-900)' }}>{s.title}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Form Container */}
        <div className="card" style={{ padding: '2.5rem', textAlign: 'left', marginBottom: '1.5rem' }}>
          {/* STEP 1: Personal Info */}
          {currentStep === 1 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--teal-50)', color: 'var(--teal-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--navy-900)' }}>Step 1: Personal Information</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--navy-600)' }}>Basic health parameters to help localize your medicine searches.</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.personalInfo.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        personalInfo: { ...formData.personalInfo, name: e.target.value },
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Age (years)</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    placeholder="e.g. 34"
                    className="form-input"
                    value={formData.personalInfo.age}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        personalInfo: { ...formData.personalInfo, age: e.target.value },
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Gender (optional)</label>
                  <select
                    className="form-select"
                    value={formData.personalInfo.gender}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        personalInfo: { ...formData.personalInfo, gender: e.target.value },
                      })
                    }
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Primary Location / Area</label>
                  <input
                    type="text"
                    placeholder="e.g. Connaught Place, New Delhi"
                    className="form-input"
                    value={formData.personalInfo.location}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        personalInfo: { ...formData.personalInfo, location: e.target.value },
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Height (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 175 cm or 5'9''"
                    className="form-input"
                    value={formData.personalInfo.height}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        personalInfo: { ...formData.personalInfo, height: e.target.value },
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Weight (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 70 kg"
                    className="form-input"
                    value={formData.personalInfo.weight}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        personalInfo: { ...formData.personalInfo, weight: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Health Conditions */}
          {currentStep === 2 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--rose-50)', color: 'var(--rose-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Heart size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--navy-900)' }}>Step 2: Existing Health Conditions</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--navy-600)' }}>Select any conditions you currently manage (select all that apply):</p>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '0.75rem',
                  marginBottom: '1.5rem',
                }}
              >
                {conditionOptions.map((cond) => {
                  const isChecked = formData.conditions.includes(cond);
                  return (
                    <div
                      key={cond}
                      onClick={() => handleConditionToggle(cond)}
                      style={{
                        padding: '1rem',
                        borderRadius: 'var(--radius-md)',
                        border: isChecked ? '2px solid var(--teal-600)' : '1px solid var(--slate-300)',
                        backgroundColor: isChecked ? 'var(--teal-50)' : 'var(--white)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span style={{ fontWeight: 600, fontSize: '0.9rem', color: isChecked ? 'var(--teal-700)' : 'var(--navy-800)' }}>
                        {cond}
                      </span>
                      {isChecked && <CheckCircle size={18} color="var(--teal-600)" />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Current Medications */}
          {currentStep === 3 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--teal-50)', color: 'var(--teal-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Pill size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--navy-900)' }}>Step 3: Current Prescriptions & Medications</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--navy-600)' }}>Record what medicines you are currently taking.</p>
                </div>
              </div>

              {/* Taking meds question */}
              <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--slate-50)', borderRadius: 'var(--radius-md)' }}>
                <label style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--navy-900)', display: 'block', marginBottom: '0.65rem' }}>
                  Are you currently taking any prescribed medications?
                </label>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontWeight: 600 }}>
                    <input
                      type="radio"
                      name="takingMeds"
                      checked={formData.takingMedicinesCurrently === true}
                      onChange={() => setFormData({ ...formData, takingMedicinesCurrently: true })}
                      style={{ accentColor: 'var(--teal-600)', width: '18px', height: '18px' }}
                    />
                    Yes, I take prescribed medicines
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontWeight: 600 }}>
                    <input
                      type="radio"
                      name="takingMeds"
                      checked={formData.takingMedicinesCurrently === false}
                      onChange={() => setFormData({ ...formData, takingMedicinesCurrently: false })}
                      style={{ accentColor: 'var(--teal-600)', width: '18px', height: '18px' }}
                    />
                    No, not taking any currently
                  </label>
                </div>
              </div>

              {formData.takingMedicinesCurrently && (
                <>
                  {/* Add Medication Box */}
                  <div
                    style={{
                      border: '1px solid var(--slate-300)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1.25rem',
                      backgroundColor: 'var(--white)',
                      marginBottom: '1.5rem',
                    }}
                  >
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--navy-800)', marginBottom: '0.75rem' }}>
                      Add a Prescribed Medication
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <input
                        type="text"
                        placeholder="Medicine name (e.g. Telmisartan)"
                        className="form-input"
                        value={tempMed.name}
                        onChange={(e) => setTempMed({ ...tempMed, name: e.target.value })}
                      />
                      <input
                        type="text"
                        placeholder="Strength/dosage (e.g. 40 mg)"
                        className="form-input"
                        value={tempMed.strength}
                        onChange={(e) => setTempMed({ ...tempMed, strength: e.target.value })}
                      />
                      <select
                        className="form-select"
                        value={tempMed.type}
                        onChange={(e) => setTempMed({ ...tempMed, type: e.target.value })}
                      >
                        <option value="Tablet">Tablet</option>
                        <option value="Capsule">Capsule</option>
                        <option value="Syrup">Syrup</option>
                        <option value="Drops">Drops</option>
                        <option value="Inhaler">Inhaler</option>
                        <option value="Injection">Injection</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <input
                        type="text"
                        placeholder="Quantity (e.g. 1)"
                        className="form-input"
                        value={tempMed.quantity}
                        onChange={(e) => setTempMed({ ...tempMed, quantity: e.target.value })}
                      />
                      <input
                        type="text"
                        placeholder="Frequency (e.g. Once daily after breakfast)"
                        className="form-input"
                        value={tempMed.frequency}
                        onChange={(e) => setTempMed({ ...tempMed, frequency: e.target.value })}
                      />
                      <button type="button" onClick={addMedication} className="btn btn-outline-teal" style={{ width: '100%' }}>
                        <Plus size={16} /> Add to List
                      </button>
                    </div>
                  </div>

                  {/* Added Medications Table */}
                  {formData.currentMedications.length > 0 && (
                    <div className="table-container" style={{ marginBottom: '1.5rem' }}>
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>Medicine</th>
                            <th>Strength</th>
                            <th>Type</th>
                            <th>Frequency</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.currentMedications.map((m, idx) => (
                            <tr key={idx}>
                              <td><strong>{m.name}</strong></td>
                              <td>{m.strength || '-'}</td>
                              <td><span className="badge badge-neutral">{m.type}</span></td>
                              <td>{m.frequency}</td>
                              <td>
                                <button
                                  type="button"
                                  onClick={() => removeMedication(idx)}
                                  style={{ background: 'none', border: 'none', color: 'var(--rose-600)', cursor: 'pointer' }}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* STEP 4: Medication Routine Schedule */}
          {currentStep === 4 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--mint-50)', color: 'var(--mint-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--navy-900)' }}>Step 4: Daily Medication Routine</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--navy-600)' }}>Schedule times and food relations for your daily doses.</p>
                </div>
              </div>

              {/* Add Routine Item Box */}
              <div
                style={{
                  border: '1px solid var(--slate-300)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  backgroundColor: 'var(--white)',
                  marginBottom: '1.5rem',
                }}
              >
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--navy-800)', marginBottom: '0.75rem' }}>
                  Add Routine Schedule Entry
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1.2fr auto', gap: '0.65rem', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="Medicine (e.g. Medicine A)"
                    className="form-input"
                    value={tempRoutine.medicine}
                    onChange={(e) => setTempRoutine({ ...tempRoutine, medicine: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Time (e.g. 8 AM or 08:00)"
                    className="form-input"
                    value={tempRoutine.time}
                    onChange={(e) => setTempRoutine({ ...tempRoutine, time: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Quantity (e.g. 1 tablet)"
                    className="form-input"
                    value={tempRoutine.quantity}
                    onChange={(e) => setTempRoutine({ ...tempRoutine, quantity: e.target.value })}
                  />
                  <select
                    className="form-select"
                    value={tempRoutine.foodRelation}
                    onChange={(e) => setTempRoutine({ ...tempRoutine, foodRelation: e.target.value })}
                  >
                    <option value="After food">After food</option>
                    <option value="Before food">Before food</option>
                    <option value="With food">With food</option>
                    <option value="Empty stomach">Empty stomach</option>
                    <option value="Anytime">Anytime</option>
                  </select>
                  <button type="button" onClick={addRoutineItem} className="btn btn-outline-teal">
                    <Plus size={16} /> Add
                  </button>
                </div>
              </div>

              {/* Routine Table */}
              <div className="table-container" style={{ marginBottom: '1.5rem' }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Medicine</th>
                      <th>Scheduled Time</th>
                      <th>Quantity</th>
                      <th>Food Relation</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.medicationRoutine.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', color: 'var(--slate-500)', padding: '1.5rem' }}>
                          No routine entries added yet. Use the form above to add your schedule.
                        </td>
                      </tr>
                    ) : (
                      formData.medicationRoutine.map((r, idx) => (
                        <tr key={idx}>
                          <td><strong>{r.medicine}</strong></td>
                          <td><span className="badge badge-primary">{r.time}</span></td>
                          <td>{r.quantity}</td>
                          <td>
                            <span className="badge badge-neutral">{r.foodRelation}</span>
                          </td>
                          <td>
                            <button
                              type="button"
                              onClick={() => removeRoutineItem(idx)}
                              style={{ background: 'none', border: 'none', color: 'var(--rose-600)', cursor: 'pointer' }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 5: Allergies */}
          {currentStep === 5 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--rose-50)', color: 'var(--rose-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertTriangle size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--navy-900)' }}>Step 5: Drug Allergies & Restrictions</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--navy-600)' }}>Critical allergy information to help avoid contraindicated medicines.</p>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--slate-50)', borderRadius: 'var(--radius-md)' }}>
                <label style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--navy-900)', display: 'block', marginBottom: '0.65rem' }}>
                  Do you have any known medicine allergies?
                </label>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontWeight: 600 }}>
                    <input
                      type="radio"
                      name="knownAllergies"
                      checked={formData.knownMedicineAllergies === true}
                      onChange={() => setFormData({ ...formData, knownMedicineAllergies: true })}
                      style={{ accentColor: 'var(--rose-600)', width: '18px', height: '18px' }}
                    />
                    Yes, I have known drug allergies
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontWeight: 600 }}>
                    <input
                      type="radio"
                      name="knownAllergies"
                      checked={formData.knownMedicineAllergies === false}
                      onChange={() => setFormData({ ...formData, knownMedicineAllergies: false, allergyDetails: '' })}
                      style={{ accentColor: 'var(--rose-600)', width: '18px', height: '18px' }}
                    />
                    No known allergies
                  </label>
                </div>
              </div>

              {formData.knownMedicineAllergies && (
                <div className="form-group">
                  <label className="form-label">Known Allergic Medicines / Substances *</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Penicillin, Sulfa drugs, Aspirin, Ibuprofen (describe reaction if known)"
                    className="form-textarea"
                    value={formData.allergyDetails}
                    onChange={(e) => setFormData({ ...formData, allergyDetails: e.target.value })}
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Other Dietary or Health Restrictions</label>
                <input
                  type="text"
                  placeholder="e.g. Low sodium, Lactose intolerant, Gluten free"
                  className="form-input"
                  value={formData.otherRestrictions}
                  onChange={(e) => setFormData({ ...formData, otherRestrictions: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* STEP 6: Health Goals */}
          {currentStep === 6 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--teal-50)', color: 'var(--teal-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Target size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--navy-900)' }}>Step 6: Health Goals & System Preferences</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--navy-600)' }}>Select what you want MediTrack to help you accomplish:</p>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '0.75rem',
                  marginBottom: '1.5rem',
                }}
              >
                {goalOptions.map((goal) => {
                  const isChecked = formData.healthGoals.includes(goal);
                  return (
                    <div
                      key={goal}
                      onClick={() => handleGoalToggle(goal)}
                      style={{
                        padding: '1rem',
                        borderRadius: 'var(--radius-md)',
                        border: isChecked ? '2px solid var(--teal-600)' : '1px solid var(--slate-300)',
                        backgroundColor: isChecked ? 'var(--teal-50)' : 'var(--white)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span style={{ fontWeight: 600, fontSize: '0.9rem', color: isChecked ? 'var(--teal-700)' : 'var(--navy-800)' }}>
                        {goal}
                      </span>
                      {isChecked && <CheckCircle size={18} color="var(--teal-600)" />}
                    </div>
                  );
                })}
              </div>

              {/* Medical Notice */}
              <div
                style={{
                  backgroundColor: 'var(--slate-50)',
                  border: '1px solid var(--slate-200)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'flex-start',
                }}
              >
                <Info size={20} color="var(--teal-600)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <p style={{ fontSize: '0.825rem', color: 'var(--navy-700)', lineHeight: 1.5 }}>
                  <strong>Important Notice:</strong> MediTrack is an organization tool for user-provided medication schedules and pharmacy discovery. It does not provide medical diagnoses or modify prescribed doses. Always follow your prescribing physician's directions.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '2rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid var(--slate-200)',
            }}
          >
            {currentStep > 1 ? (
              <button type="button" onClick={handleBack} className="btn btn-outline">
                <ArrowLeft size={16} /> Previous Step
              </button>
            ) : (
              <div />
            )}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => saveProfileToServer(false)}
                disabled={saving}
                className="btn btn-outline"
              >
                {saving ? 'Saving...' : 'Save Draft'}
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={saving}
                className="btn btn-primary"
              >
                {currentStep === 6 ? (
                  <>Complete & Go to Dashboard <CheckCircle size={16} /></>
                ) : (
                  <>Next Step <ArrowRight size={16} /></>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 640px) {
          .step-label { display: block !important; }
        }
      `}</style>
    </div>
  );
}

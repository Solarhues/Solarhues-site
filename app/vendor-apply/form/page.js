'use client';

import { useState } from 'react';
import Link from 'next/link';

const MAX_PINCODES = 10;

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  marginTop: '7px',
  padding: '13px 14px',
  border: '1px solid #475569',
  borderRadius: '10px',
  outline: 'none',
  background: '#1e293b',
  color: '#f8fafc',
  font: 'inherit',
};

const labelStyle = {
  display: 'block',
  color: '#e2e8f0',
  fontSize: '0.88rem',
  fontWeight: 700,
};

const pageStyle = {
  minHeight: '100vh',
  padding: '24px',
  color: '#f8fafc',
  background:
    'radial-gradient(circle at top right, rgba(5, 150, 105, 0.22), transparent 36%), #1e293b',
  fontFamily: 'Inter, Arial, sans-serif',
};

const sectionStyle = {
  gridColumn: '1 / -1',
  padding: '22px',
  border: '1px solid rgba(148, 163, 184, 0.18)',
  borderRadius: '16px',
  background: 'rgba(30, 41, 59, 0.48)',
};

const secondaryButtonStyle = {
  border: '1px solid rgba(250, 204, 21, 0.65)',
  borderRadius: '999px',
  padding: '10px 14px',
  background: 'transparent',
  color: '#facc15',
  font: 'inherit',
  fontWeight: 700,
  cursor: 'pointer',
};

function isValidPincode(value) {
  return /^[1-9][0-9]{5}$/.test(value);
}

function getFileName(file) {
  return file ? file.name : 'No file selected';
}

export default function VendorApplicationPage() {
  const [form, setForm] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    yearsInBusiness: '',
    serviceRadiusKm: '50',
    message: '',
  });

  const [pincodes, setPincodes] = useState(['']);
  const [documents, setDocuments] = useState({
    gstCertificate: null,
    panCard: null,
    businessRegistration: null,
    installerCertificate: null,
    cancelledCheque: null,
  });

  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function updatePincode(index, value) {
    const cleanedValue = value.replace(/\D/g, '').slice(0, 6);

    setPincodes((current) =>
      current.map((pincode, currentIndex) =>
        currentIndex === index ? cleanedValue : pincode
      )
    );
  }

  function addPincode() {
    if (pincodes.length >= MAX_PINCODES) return;

    setPincodes((current) => [...current, '']);
  }

  function removePincode(index) {
    if (pincodes.length === 1) return;

    setPincodes((current) =>
      current.filter((_, currentIndex) => currentIndex !== index)
    );
  }

  function updateDocument(event) {
    const { name, files } = event.target;

    setDocuments((current) => ({
      ...current,
      [name]: files?.[0] || null,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError('');

    const cleanedPincodes = pincodes
      .map((pincode) => pincode.trim())
      .filter(Boolean);

    const uniquePincodes = [...new Set(cleanedPincodes)];

    if (uniquePincodes.length === 0) {
      setError('Please add at least one service pincode.');
      return;
    }

    if (uniquePincodes.length > MAX_PINCODES) {
      setError(`You can add a maximum of ${MAX_PINCODES} service pincodes.`);
      return;
    }

    const invalidPincode = uniquePincodes.find(
      (pincode) => !isValidPincode(pincode)
    );

    if (invalidPincode) {
      setError(
        `"${invalidPincode}" is not a valid Indian pincode. Enter a 6-digit pincode beginning with 1 to 9.`
      );
      return;
    }

    if (!documents.gstCertificate) {
      setError('Please upload your GST certificate.');
      return;
    }

    if (!documents.panCard) {
      setError('Please upload your PAN card.');
      return;
    }

    if (!documents.businessRegistration) {
      setError('Please upload your business registration document.');
      return;
    }

    // The next implementation step will:
    // 1. create the authenticated vendor profile,
    // 2. save business details and pincodes,
    // 3. upload selected documents to private Supabase Storage.
    setSubmitted(true);
  }

  return (
    <main style={pageStyle}>
      <div
        style={{
          width: 'min(860px, 100%)',
          margin: '0 auto',
        }}
      >
        <nav
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '34px',
          }}
        >
          <Link
            href="/"
            style={{
              color: '#facc15',
              fontFamily: '"Space Grotesk", Arial, sans-serif',
              fontSize: '1.2rem',
              fontWeight: 800,
              textDecoration: 'none',
            }}
          >
            SolarHues
          </Link>

          <Link
            href="/vendor-apply"
            style={{
              color: '#cbd5e1',
              fontSize: '0.9rem',
              textDecoration: 'none',
            }}
          >
            ← Installer information
          </Link>
        </nav>

        <section
          style={{
            padding: 'clamp(22px, 5vw, 40px)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '24px',
            background: 'rgba(15, 23, 42, 0.88)',
            boxShadow: '0 24px 70px rgba(2, 6, 23, 0.35)',
          }}
        >
          {submitted ? (
            <div>
              <p
                style={{
                  margin: '0 0 10px',
                  color: '#facc15',
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                }}
              >
                Details checked
              </p>

              <h1
                style={{
                  margin: 0,
                  fontFamily: '"Space Grotesk", Arial, sans-serif',
                  fontSize: 'clamp(2rem, 5vw, 3rem)',
                }}
              >
                Your application details are ready.
              </h1>

              <p
                style={{
                  margin: '16px 0 12px',
                  color: '#cbd5e1',
                  lineHeight: 1.7,
                }}
              >
                You added {pincodes.filter(Boolean).length} service pincode
                {pincodes.filter(Boolean).length === 1 ? '' : 's'}.
              </p>

              <p
                style={{
                  margin: '0 0 26px',
                  color: '#cbd5e1',
                  lineHeight: 1.7,
                }}
              >
                In the next step, this form will securely save your application
                and upload documents to SolarHues private storage for review.
              </p>

              <button
                type="button"
                onClick={() => setSubmitted(false)}
                style={{
                  border: 0,
                  borderRadius: '999px',
                  padding: '13px 18px',
                  background: '#facc15',
                  color: '#422006',
                  font: 'inherit',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Edit application
              </button>
            </div>
          ) : (
            <>
              <p
                style={{
                  margin: '0 0 10px',
                  color: '#facc15',
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                }}
              >
                Installer application
              </p>

              <h1
                style={{
                  margin: 0,
                  fontFamily: '"Space Grotesk", Arial, sans-serif',
                  fontSize: 'clamp(2rem, 5vw, 3rem)',
                  lineHeight: 1.08,
                }}
              >
                Tell us about your solar installation business.
              </h1>

              <p
                style={{
                  margin: '15px 0 28px',
                  color: '#cbd5e1',
                  lineHeight: 1.65,
                }}
              >
                Add your company details, up to 10 service pincodes, and
                verification documents. Approval is required before receiving
                marketplace leads.
              </p>

              <form
                onSubmit={handleSubmit}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: '18px',
                }}
              >
                <label style={labelStyle}>
                  Company name
                  <input
                    style={inputStyle}
                    name="companyName"
                    value={form.companyName}
                    onChange={updateField}
                    placeholder="Example Solar Private Limited"
                    required
                  />
                </label>

                <label style={labelStyle}>
                  Contact person
                  <input
                    style={inputStyle}
                    name="contactName"
                    value={form.contactName}
                    onChange={updateField}
                    placeholder="Full name"
                    required
                  />
                </label>

                <label style={labelStyle}>
                  Business email
                  <input
                    style={inputStyle}
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={updateField}
                    placeholder="you@company.com"
                    required
                  />
                </label>

                <label style={labelStyle}>
                  Mobile number
                  <input
                    style={inputStyle}
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={updateField}
                    placeholder="10-digit mobile number"
                    required
                  />
                </label>

                <label style={labelStyle}>
                  City
                  <input
                    style={inputStyle}
                    name="city"
                    value={form.city}
                    onChange={updateField}
                    placeholder="Example: Bengaluru"
                    required
                  />
                </label>

                <label style={labelStyle}>
                  State
                  <input
                    style={inputStyle}
                    name="state"
                    value={form.state}
                    onChange={updateField}
                    placeholder="Example: Karnataka"
                    required
                  />
                </label>

                <label style={labelStyle}>
                  Years in business
                  <input
                    style={inputStyle}
                    type="number"
                    min="0"
                    name="yearsInBusiness"
                    value={form.yearsInBusiness}
                    onChange={updateField}
                    placeholder="Example: 5"
                    required
                  />
                </label>

                <label style={labelStyle}>
                  Service radius in km
                  <input
                    style={inputStyle}
                    type="number"
                    min="1"
                    name="serviceRadiusKm"
                    value={form.serviceRadiusKm}
                    onChange={updateField}
                    required
                  />
                </label>

                <section style={sectionStyle}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '16px',
                      marginBottom: '16px',
                    }}
                  >
                    <div>
                      <p
                        style={{
                          margin: 0,
                          color: '#f8fafc',
                          fontSize: '1.05rem',
                          fontWeight: 800,
                        }}
                      >
                        Service pincodes
                      </p>

                      <p
                        style={{
                          margin: '6px 0 0',
                          color: '#94a3b8',
                          fontSize: '0.86rem',
                          lineHeight: 1.5,
                        }}
                      >
                        Add up to {MAX_PINCODES} 6-digit pincodes where you can
                        serve solar customers.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={addPincode}
                      disabled={pincodes.length >= MAX_PINCODES}
                      style={{
                        ...secondaryButtonStyle,
                        opacity: pincodes.length >= MAX_PINCODES ? 0.45 : 1,
                        cursor:
                          pincodes.length >= MAX_PINCODES
                            ? 'not-allowed'
                            : 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      + Add pincode
                    </button>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                      gap: '12px',
                    }}
                  >
                    {pincodes.map((pincode, index) => (
                      <div key={`pincode-${index}`}>
                        <label style={labelStyle}>
                          Pincode {index + 1}
                          <input
                            style={inputStyle}
                            type="text"
                            inputMode="numeric"
                            autoComplete="postal-code"
                            value={pincode}
                            onChange={(event) =>
                              updatePincode(index, event.target.value)
                            }
                            placeholder="6-digit pincode"
                            maxLength="6"
                            required={index === 0}
                          />
                        </label>

                        {pincodes.length > 1 ? (
                          <button
                            type="button"
                            onClick={() => removePincode(index)}
                            style={{
                              marginTop: '8px',
                              border: 0,
                              background: 'transparent',
                              color: '#fca5a5',
                              font: 'inherit',
                              fontSize: '0.82rem',
                              cursor: 'pointer',
                              padding: 0,
                            }}
                          >
                            Remove
                          </button>
                        ) : null}
                      </div>
                    ))}
                  </div>

                  <p
                    style={{
                      margin: '14px 0 0',
                      color: '#94a3b8',
                      fontSize: '0.8rem',
                    }}
                  >
                    {pincodes.filter(Boolean).length} of {MAX_PINCODES} service
                    pincodes added.
                  </p>
                </section>

                <section style={sectionStyle}>
                  <p
                    style={{
                      margin: 0,
                      color: '#f8fafc',
                      fontSize: '1.05rem',
                      fontWeight: 800,
                    }}
                  >
                    Verification documents
                  </p>

                  <p
                    style={{
                      margin: '6px 0 18px',
                      color: '#94a3b8',
                      fontSize: '0.86rem',
                      lineHeight: 1.5,
                    }}
                  >
                    Upload clear PDF, JPG, JPEG, or PNG files. Keep file size
                    under 10 MB per document. Your files will be stored
                    privately and reviewed by SolarHues.
                  </p>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                      gap: '16px',
                    }}
                  >
                    <label style={labelStyle}>
                      GST certificate <span style={{ color: '#facc15' }}>*</span>
                      <input
                        style={inputStyle}
                        type="file"
                        name="gstCertificate"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={updateDocument}
                        required
                      />
                      <small style={{ color: '#94a3b8' }}>
                        {getFileName(documents.gstCertificate)}
                      </small>
                    </label>

                    <label style={labelStyle}>
                      PAN card <span style={{ color: '#facc15' }}>*</span>
                      <input
                        style={inputStyle}
                        type="file"
                        name="panCard"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={updateDocument}
                        required
                      />
                      <small style={{ color: '#94a3b8' }}>
                        {getFileName(documents.panCard)}
                      </small>
                    </label>

                    <label style={labelStyle}>
                      Business registration <span style={{ color: '#facc15' }}>*</span>
                      <input
                        style={inputStyle}
                        type="file"
                        name="businessRegistration"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={updateDocument}
                        required
                      />
                      <small style={{ color: '#94a3b8' }}>
                        {getFileName(documents.businessRegistration)}
                      </small>
                    </label>

                    <label style={labelStyle}>
                      Solar installer certificate
                      <input
                        style={inputStyle}
                        type="file"
                        name="installerCertificate"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={updateDocument}
                      />
                      <small style={{ color: '#94a3b8' }}>
                        {getFileName(documents.installerCertificate)}
                      </small>
                    </label>

                    <label
                      style={{
                        ...labelStyle,
                        gridColumn: '1 / -1',
                      }}
                    >
                      Cancelled cheque / bank proof
                      <input
                        style={inputStyle}
                        type="file"
                        name="cancelledCheque"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={updateDocument}
                      />
                      <small style={{ color: '#94a3b8' }}>
                        {getFileName(documents.cancelledCheque)}
                      </small>
                    </label>
                  </div>
                </section>

                <label
                  style={{
                    ...labelStyle,
                    gridColumn: '1 / -1',
                  }}
                >
                  Briefly describe your installation experience
                  <textarea
                    style={{
                      ...inputStyle,
                      minHeight: '120px',
                      resize: 'vertical',
                    }}
                    name="message"
                    value={form.message}
                    onChange={updateField}
                    placeholder="System sizes, cities served, brands installed, certifications, past project experience, etc."
                  />
                </label>

                {error ? (
                  <p
                    role="alert"
                    style={{
                      gridColumn: '1 / -1',
                      margin: 0,
                      padding: '12px 14px',
                      border: '1px solid rgba(248, 113, 113, 0.35)',
                      borderRadius: '12px',
                      background: 'rgba(220, 38, 38, 0.14)',
                      color: '#fecaca',
                      lineHeight: 1.5,
                    }}
                  >
                    {error}
                  </p>
                ) : null}

                <div
                  style={{
                    gridColumn: '1 / -1',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    marginTop: '4px',
                  }}
                >
                  <button
                    type="submit"
                    style={{
                      border: 0,
                      borderRadius: '999px',
                      padding: '14px 20px',
                      background: '#facc15',
                      color: '#422006',
                      font: 'inherit',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    Continue to review
                  </button>
                </div>
              </form>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

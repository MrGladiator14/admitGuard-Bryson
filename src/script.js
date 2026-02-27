// Configuration-driven validation engine
let validationConfig = {};
let fields = {};
let exc = {};
let state = {};

// Audit Trail System
const AUDIT_STORAGE_KEY = 'admitguard_audit_log';
const AUDIT_JSON_FILE = 'audit_log.json';
let auditLog = [];

// Tab Navigation System
function initializeTabNavigation() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTab = button.dataset.tab;
      
      // Update button states
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      // Update pane visibility
      tabPanes.forEach(pane => pane.classList.remove('active'));
      document.getElementById(`${targetTab}-tab`).classList.add('active');
      
      // Load audit data when switching to audit tab
      if (targetTab === 'audit') {
        console.log('🔄 Switching to audit tab, reloading data');
        loadAuditLog();
        // Force update display after a small delay to ensure DOM is ready
        setTimeout(() => updateAuditDisplay(), 100);
      }
    });
  });
}

// Audit Trail Functions
function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatTimestamp(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function saveAuditLog() {
  try {
    // Save to localStorage
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(auditLog, null, 2));
    console.log('Audit log saved to localStorage');
    
    // Don't auto-download file - let user manually download when needed
    console.log('JSON backup ready - use Download button when needed');
  } catch (error) {
    console.error('Failed to save audit log:', error);
  }
}

function saveAuditLogToFile() {
  try {
    const dataStr = JSON.stringify(auditLog, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    // Create a temporary link to trigger download with timestamp
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `audit_log_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    
    console.log('Audit log backed up to local JSON file');
    
    // Show brief notification
    const syncBtn = document.getElementById('syncBtn');
    if (syncBtn) {
      const originalText = syncBtn.textContent;
      syncBtn.textContent = '✓ Backup Created';
      syncBtn.style.background = '#e8f0ea';
      syncBtn.style.color = '#2d5a3d';
      
      setTimeout(() => {
        syncBtn.textContent = originalText;
        syncBtn.style.background = '';
        syncBtn.style.color = '';
      }, 2000);
    }
  } catch (error) {
    console.error('Failed to save audit log to file:', error);
  }
}

function downloadAuditLog() {
  try {
    const dataStr = JSON.stringify(auditLog, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    // Create download link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit_log_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('Audit log downloaded as JSON file');
    
    // Show brief feedback
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
      const originalText = downloadBtn.textContent;
      downloadBtn.textContent = '✓ Downloaded';
      downloadBtn.style.background = '#e8f0ea';
      downloadBtn.style.color = '#2d5a3d';
      
      setTimeout(() => {
        downloadBtn.textContent = originalText;
        downloadBtn.style.background = '';
        downloadBtn.style.color = '';
      }, 2000);
    }
  } catch (error) {
    console.error('Failed to download audit log:', error);
  }
}

function loadAuditLog() {
  try {
    const stored = localStorage.getItem(AUDIT_STORAGE_KEY);
    auditLog = stored ? JSON.parse(stored) : [];
    console.log('Loaded', auditLog.length, 'audit entries from localStorage');
  } catch (error) {
    console.error('Failed to load audit log:', error);
    auditLog = [];
  }
  updateAuditDisplay();
}

function syncAuditLogFromFile() {
  try {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (event) => {
      const file = event.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const fileData = JSON.parse(e.target.result);
          
          // Validate that it's audit data
          if (Array.isArray(fileData)) {
            // Merge with existing data, avoiding duplicates
            const existingIds = new Set(auditLog.map(entry => entry.id));
            const newEntries = fileData.filter(entry => !existingIds.has(entry.id));
            
            if (newEntries.length > 0) {
              auditLog = [...newEntries, ...auditLog]; // New entries first
              saveAuditLog();
              updateAuditDisplay();
              console.log(`Synced ${newEntries.length} new entries from file`);
            } else {
              console.log('No new entries to sync from file');
            }
          } else {
            console.error('Invalid audit log file format');
          }
        } catch (parseError) {
          console.error('Failed to parse audit log file:', parseError);
        }
      };
      reader.readAsText(file);
    };
    
    input.click();
  } catch (error) {
    console.error('Failed to sync audit log from file:', error);
  }
}

function addAuditEntry(formData) {
  const entry = {
    id: generateUniqueId(),
    timestamp: new Date().toISOString(),
    payload: { ...formData },
    exceptionCount: Object.keys(formData.exceptions || {}).length,
    exceptionFields: Object.keys(formData.exceptions || {}),
    flaggedForManager: formData.flagged || false
  };
  
  auditLog.unshift(entry); // Add to beginning for reverse chronological order
  saveAuditLog();
  updateAuditDisplay();
  
  console.log('Audit entry added:', entry.id);
}

function updateAuditDisplay() {
  const tbody = document.getElementById('auditTableBody');
  const emptyState = document.getElementById('emptyState');
  const totalSubmissions = document.getElementById('totalSubmissions');
  const flaggedCount = document.getElementById('flaggedCount');
  
  console.log('🔄 Updating audit display, entries:', auditLog.length);
  
  // Check if audit tab elements exist
  if (!tbody || !emptyState || !totalSubmissions || !flaggedCount) {
    console.log('⚠️ Audit display elements not found (audit tab not loaded yet)');
    return;
  }
  
  // Update summary
  totalSubmissions.textContent = auditLog.length;
  flaggedCount.textContent = auditLog.filter(entry => entry.flaggedForManager).length;
  
  // Clear existing table content
  tbody.innerHTML = '';
  
  if (auditLog.length === 0) {
    emptyState.style.display = 'block';
    return;
  }
  
  emptyState.style.display = 'none';
  
  // Populate table
  auditLog.forEach(entry => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${entry.payload.fullName || 'N/A'}</td>
      <td>${formatTimestamp(entry.timestamp)}</td>
      <td>${entry.exceptionCount}</td>
      <td>
        <span class="flag-badge ${entry.flaggedForManager ? 'yes' : 'no'}">
          ${entry.flaggedForManager ? 'Yes' : 'No'}
        </span>
      </td>
      <td>
        <div class="action-buttons">
          <button class="action-btn details-btn" onclick="toggleAuditDetail('${entry.id}')">
            View Details
          </button>
          <button class="action-btn ${entry.flaggedForManager ? 'unflag-btn' : 'flag-btn'}" onclick="toggleFlagStatus('${entry.id}')">
            ${entry.flaggedForManager ? 'Unflag' : 'Flag'}
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
    
    // Add detail row
    const detailRow = createDetailRow(entry);
    tbody.appendChild(detailRow);
  });
  
  console.log('✅ Audit display updated successfully');
}

function createDetailRow(entry) {
  const row = document.createElement('tr');
  row.className = 'audit-detail';
  row.id = `detail-${entry.id}`;
  
  let exceptionsHtml = '';
  if (entry.exceptionFields.length > 0) {
    exceptionsHtml = `
      <div class="detail-section">
        <div class="detail-title">Exceptions (${entry.exceptionCount})</div>
        <ul class="exception-list">
          ${entry.exceptionFields.map(field => `
            <li>
              <div class="exception-field">${field}</div>
              <div class="exception-rationale">${entry.payload.exceptions[field]?.rationale || 'No rationale provided'}</div>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }
  
  // Format submission data in a user-friendly way
  const formatSubmissionData = (payload) => {
    const fieldOrder = [
      'fullName', 'email', 'phone', 'aadhaarNumber',
      'highestQualification', 'graduationYear', 'percentageCgpa', 'screeningScore',
      'interviewStatus', 'offerLetterSent'
    ];
    
    let html = '<div class="formatted-data">';
    
    fieldOrder.forEach(fieldKey => {
      if (payload[fieldKey]) {
        const fieldConfig = validationConfig.rules.find(rule => rule.field === fieldKey);
        const label = fieldConfig ? fieldConfig.label : fieldKey.replace(/([A-Z])/g, ' $1').trim();
        let value = payload[fieldKey];
        
        // Special handling for percentage/CGPA mode
        if (fieldKey === 'percentageCgpa') {
          // Try to determine mode from value or use default
          const mode = parseFloat(value) > 10 ? 'Percentage (%)' : 'CGPA (10-point)';
          value = `${value} (${mode})`;
        }
        
        html += `
          <div class="data-row">
            <span class="data-label">${label}:</span>
            <span class="data-value">${value}</span>
          </div>
        `;
      }
    });
    
    // Add flagged status if present
    if (payload.flagged) {
      html += `
        <div class="data-row flagged">
          <span class="data-label">Flagged for Review:</span>
          <span class="data-value warning">Yes - ${payload.flagReason || 'Multiple exceptions'}</span>
        </div>
      `;
    }
    
    html += '</div>';
    return html;
  };
  
  row.innerHTML = `
    <td colspan="5">
      <div class="detail-section">
        <div class="detail-title">Submission Details</div>
        <div class="detail-content">
          <strong>Candidate:</strong> ${entry.payload.fullName || 'N/A'}<br>
          ${entry.payload.email ? `<strong>Email:</strong> ${entry.payload.email}<br>` : ''}
          ${entry.payload.phone ? `<strong>Phone:</strong> ${entry.payload.phone}<br>` : ''}
          ${entry.payload.interviewStatus ? `<strong>Interview Status:</strong> ${entry.payload.interviewStatus}<br>` : ''}
          <strong>Flagged for Review:</strong> ${entry.flaggedForManager ? 'Yes' : 'No'}
          ${entry.flaggedForManager && entry.flagReason ? `
            <br><strong>Flag Reason:</strong> ${entry.flagReason}
            <br><strong>Flagged By:</strong> ${entry.flaggedBy || 'Administrator'} on ${formatTimestamp(entry.flaggedAt)}
          ` : ''}
          ${entry.unflaggedAt ? `
            <br><strong>Unflagged:</strong> Yes on ${formatTimestamp(entry.unflaggedAt)} by ${entry.unflaggedBy || 'Administrator'}
          ` : ''}
        </div>
      </div>
      ${exceptionsHtml}
      <div class="detail-section">
        <div class="detail-title">Complete Submission Data</div>
        ${formatSubmissionData(entry.payload)}
      </div>
    </td>
  `;
  
  return row;
}

function toggleAuditDetail(entryId) {
  const detailRow = document.getElementById(`detail-${entryId}`);
  if (detailRow) {
    detailRow.classList.toggle('show');
  }
}

function toggleFlagStatus(entryId) {
  const entryIndex = auditLog.findIndex(entry => entry.id === entryId);
  if (entryIndex === -1) return;
  
  const entry = auditLog[entryIndex];
  const isCurrentlyFlagged = entry.flaggedForManager;
  
  if (isCurrentlyFlagged) {
    // Unflag the candidate
    if (confirm('Are you sure you want to unflag this candidate? This action will remove the manager review flag.')) {
      entry.flaggedForManager = false;
      entry.unflaggedAt = new Date().toISOString();
      entry.unflaggedBy = 'Administrator';
      
      // Update the payload as well
      if (entry.payload) {
        entry.payload.flagged = false;
        entry.payload.unflaggedAt = entry.unflaggedAt;
        entry.payload.unflaggedBy = entry.unflaggedBy;
      }
      
      showNotification('Candidate Unflagged', 'success');
    }
  } else {
    // Flag the candidate
    const reason = prompt('Please provide a reason for flagging this candidate for manager review:');
    if (reason && reason.trim()) {
      entry.flaggedForManager = true;
      entry.flaggedAt = new Date().toISOString();
      entry.flaggedBy = 'Administrator';
      entry.flagReason = reason.trim();
      
      // Update the payload as well
      if (entry.payload) {
        entry.payload.flagged = true;
        entry.payload.flaggedAt = entry.flaggedAt;
        entry.payload.flaggedBy = entry.flaggedBy;
        entry.payload.flagReason = entry.flagReason;
      }
      
      showNotification('Candidate Flagged for Review', 'warning');
    }
  }
  
  // Save changes and update display
  saveAuditLog();
  updateAuditDisplay();
  
  console.log(`Candidate ${entryId} flag status updated: ${entry.flaggedForManager ? 'Flagged' : 'Unflagged'}`);
}

function showNotification(message, type = 'info') {
  const syncBtn = document.getElementById('syncBtn');
  if (!syncBtn) return;
  
  const originalText = syncBtn.textContent;
  const originalBackground = syncBtn.style.background;
  const originalColor = syncBtn.style.color;
  
  syncBtn.textContent = message;
  
  // Set colors based on type
  if (type === 'success') {
    syncBtn.style.background = '#e8f0ea';
    syncBtn.style.color = '#2d5a3d';
  } else if (type === 'warning') {
    syncBtn.style.background = '#fff3cd';
    syncBtn.style.color = '#856404';
  } else {
    syncBtn.style.background = '#d1ecf1';
    syncBtn.style.color = '#0c5460';
  }
  
  setTimeout(() => {
    syncBtn.textContent = originalText;
    syncBtn.style.background = originalBackground;
    syncBtn.style.color = originalColor;
  }, 2500);
}

function clearAuditLog() {
  if (confirm('Are you sure you want to clear all audit entries? This action cannot be undone.')) {
    auditLog = [];
    saveAuditLog();
    updateAuditDisplay();
  }
}

// Load configuration and initialize validation system
async function loadValidationConfig() {
  try {
    const response = await fetch('./schema.json');
    validationConfig = await response.json();
    console.log('Configuration loaded successfully');
    initializeValidationSystem();
  } catch (error) {
    console.error('Failed to load validation configuration:', error);
  }
}

// Generate form fields dynamically from configuration
function generateFormFromConfig() {
  const formBody = document.querySelector('.form-body');
  if (!formBody) return;
  
  formBody.innerHTML = '';
  
  validationConfig.rules.forEach(rule => {
    const fieldDiv = document.createElement('div');
    fieldDiv.className = 'field';
    
    // Add span2 class for offerLetterSent field
    if (rule.field === 'offerLetterSent') {
      fieldDiv.className += ' span2';
    }
    
    // Create label
    const label = document.createElement('label');
    label.setAttribute('for', rule.field);
    label.textContent = rule.label + ' *';
    fieldDiv.appendChild(label);
    
    // Create input based on type
    let input;
    if (rule.inputType === 'select') {
      input = document.createElement('select');
      input.id = rule.field;
      
      // Add empty option
      const emptyOption = document.createElement('option');
      emptyOption.value = '';
      emptyOption.textContent = rule.field === 'highestQualification' ? 'Select qualification' : 
                               rule.field === 'interviewStatus' ? 'Select status' : 
                               rule.field === 'offerLetterSent' ? 'Select option' : 
                               rule.field === 'screeningScore' ? 'Enter score' : '';
      input.appendChild(emptyOption);
      
      // Add options from config
      if (rule.options) {
        rule.options.forEach(option => {
          if (option) {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            input.appendChild(optionElement);
          }
        });
      }
    } else {
      input = document.createElement('input');
      input.id = rule.field;
      input.type = rule.inputType;
      
      // Add placeholder if applicable
      if (rule.field === 'fullName') input.placeholder = 'Jane Doe';
      else if (rule.field === 'email') input.placeholder = 'you@example.com';
      else if (rule.field === 'phone') input.placeholder = '9876543210';
      else if (rule.field === 'graduationYear') input.placeholder = '2022';
      else if (rule.field === 'percentageCgpa') input.placeholder = '72.5';
      else if (rule.field === 'screeningScore') input.placeholder = '65';
      else if (rule.field === 'aadhaarNumber') input.placeholder = '123456789012';
      
      // Add attributes from config
      if (rule.attributes) {
        Object.entries(rule.attributes).forEach(([key, value]) => {
          input.setAttribute(key, value);
        });
      }
    }
    
    fieldDiv.appendChild(input);
    
    // Add hint div
    const hintDiv = document.createElement('div');
    hintDiv.className = 'hint';
    hintDiv.id = rule.field + 'Hint';
    fieldDiv.appendChild(hintDiv);
    
    // Add exception panel if allowed
    if (rule.exceptionAllowed) {
      const exceptionPanel = document.createElement('div');
      exceptionPanel.className = 'exception-panel';
      exceptionPanel.id = rule.field + 'Exc';
      
      // Exception rationale textarea (always visible)
      const excTextarea = document.createElement('textarea');
      excTextarea.className = 'exc-ta';
      excTextarea.id = rule.field + 'Rationale';
      excTextarea.placeholder = 'Provide justification for exception...';
      exceptionPanel.appendChild(excTextarea);
      
      // Exception help text
      const excHelp = document.createElement('div');
      excHelp.className = 'exc-help';
      const keywords = rule.rationaleKeywords.map(k => `"${k}"`).join(' or ');
      excHelp.innerHTML = `Min 30 chars. Must include: <strong>${keywords}</strong>`;
      exceptionPanel.appendChild(excHelp);
      
      // Exception hint
      const excHint = document.createElement('div');
      excHint.className = 'exc-hint hint';
      excHint.id = rule.field + 'RationaleHint';
      exceptionPanel.appendChild(excHint);
      
      fieldDiv.appendChild(exceptionPanel);
    }
    
    // Special handling for percentage/CGPA toggle
    if (rule.field === 'percentageCgpa') {
      const toggleRow = document.createElement('div');
      toggleRow.className = 'toggle-row';
      
      const modeSpan = document.createElement('span');
      modeSpan.textContent = 'Mode:';
      toggleRow.appendChild(modeSpan);
      
      const toggleDiv = document.createElement('div');
      toggleDiv.className = 'toggle on';
      toggleDiv.id = 'modeToggle';
      toggleRow.appendChild(toggleDiv);
      
      const modeLabel = document.createElement('span');
      modeLabel.id = 'modeLabel';
      modeLabel.textContent = 'Percentage (%)';
      toggleRow.appendChild(modeLabel);
      
      fieldDiv.insertBefore(toggleRow, label);
    }
    
    formBody.appendChild(fieldDiv);
  });
}

function initializeValidationSystem() {
  // Convert config to field definitions
  fields = {};
  exc = {};
  
  validationConfig.rules.forEach(rule => {
    fields[rule.field] = {
      el: rule.field,
      strict: rule.type === 'strict',
      re: rule.validation.startsWith('ageRange') || rule.validation.startsWith('minPercentage') || rule.validation === 'screeningScore' 
        ? null 
        : new RegExp(rule.validation),
      fn: getCustomValidator(rule.validation),
      msg: rule.errorMessage,
      hasException: rule.exceptionAllowed,
      rationaleKeywords: rule.rationaleKeywords
    };
    
    if (rule.exceptionAllowed) {
      exc[rule.field] = { on: false, text: '' };
    }
  });
  
  // Initialize state
  Object.keys(fields).forEach(key => state[key] = false);
  
  // Debug logging
  console.log('Validation system initialized with', Object.keys(fields).length, 'fields');
  console.log('Exception fields:', Object.keys(exc));
}

function age(dob) {
  const t = new Date(), b = new Date(dob);
  let a = t.getFullYear() - b.getFullYear();
  if (t.getMonth() < b.getMonth() || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) a--;
  return a;
}

// Custom validation functions based on configuration
function getCustomValidator(validationRule) {
  if (validationRule.startsWith('ageRange')) {
    const [min, max] = validationRule.split(':')[1].split('-').map(Number);
    return (v) => {
      const a = age(v);
      return a >= min && a <= max;
    };
  }
  
  if (validationRule.startsWith('minPercentage')) {
    const rules = validationRule.split(',');
    let minPercentage = 60;
    let minCGPA = 6.0;
    
    rules.forEach(rule => {
      if (rule.startsWith('minPercentage:')) {
        minPercentage = parseFloat(rule.split(':')[1]);
      }
      if (rule.startsWith('minCGPA:')) {
        minCGPA = parseFloat(rule.split(':')[1]);
      }
    });
    
    return (v) => {
      const n = parseFloat(v);
      if (isNaN(n)) return false;
      return n >= 10 ? n >= minPercentage : n >= minCGPA;
    };
  }
  
  if (validationRule === 'screeningScore') {
    return (v) => {
      const n = parseFloat(v);
      return n >= 40 && n <= 100;
    };
  }
  
  // For offer letter validation
  if (validationRule === 'offerLetter') {
    return (v) => {
      if (!/^(Yes|No)$/.test(v)) return false;
      if (v === 'Yes') { 
        const s = document.getElementById('intStatus').value; 
        return s === 'Cleared' || s === 'Waitlisted'; 
      }
      return true;
    };
  }
  
  return null;
}

// Legacy functions for backward compatibility
function validateDob(v) { const a = age(v); return a >= 18 && a <= 35; }
function validateGrade(v) { const n = parseFloat(v); if (isNaN(n)) return false; return n >= 10 ? n >= 60 : n >= 6.0; }
function validateScore(v) { const n = parseFloat(v); return n >= 40 && n <= 100; }
function validateOffer(v) {
  if (!/^(Yes|No)$/.test(v)) return false;
  if (v === 'Yes') { const s = document.getElementById('intStatus').value; return s === 'Cleared' || s === 'Waitlisted'; }
  return true;
}

function countActiveExceptions() {
  return Object.keys(exc).filter(key => {
    const e = exc[key];
    return e && e.text.trim().length > 0 && checkRationale(e.text, key) === '';
  }).length;
}

function updateExceptionCounter() {
  const count = countActiveExceptions();
  const counterEl = document.getElementById('exceptionCounter');
  const maxExceptions = Object.keys(exc).length;
  counterEl.textContent = `Active Exceptions: ${count}/${maxExceptions}`;
  
  // Update warning banner visibility
  const warningBanner = document.getElementById('warningBanner');
  if (count > 2) {
    warningBanner.classList.add('show');
  } else {
    warningBanner.classList.remove('show');
  }
  
  return count;
}

function checkRationale(text, fieldKey) {
  const t = text.trim();
  if (t.length < 30) return 'Rationale must be at least 30 characters.';
  
  // Get required keywords from configuration
  const fieldConfig = validationConfig.rules.find(rule => rule.field === fieldKey);
  if (fieldConfig && fieldConfig.rationaleKeywords && fieldConfig.rationaleKeywords.length > 0) {
    const keywords = fieldConfig.rationaleKeywords;
    if (!keywords.some(p => t.toLowerCase().includes(p))) {
      return `Must include: ${keywords.map(k => `"${k}"`).join(' or ')}.`;
    }
  }
  
  return '';
}

function validate(key) {
  const f = fields[key];
  if (!f) return false;
  
  const el = document.getElementById(f.el);
  const hintEl = document.getElementById(f.el + 'Hint');
  const excPanel = document.getElementById(f.el + 'Exc');
  const excRatEl = document.getElementById(f.el + 'RationaleHint');
  const v = el.value.trim();

  el.classList.remove('err','warn');
  hintEl.className = 'hint';
  hintEl.textContent = '';

  if (!v) {
    el.classList.add('err');
    hintEl.className = 'hint err';
    const fieldConfig = validationConfig.rules.find(rule => rule.field === key);
    const label = fieldConfig ? fieldConfig.label : key.replace(/([A-Z])/g,' $1').trim();
    hintEl.textContent = `${label} is required.`;
    state[key] = false;
    return false;
  }

  let ok = f.re ? f.re.test(v) : (f.fn ? f.fn(v) : true);

  if (!ok && !f.strict && f.hasException) {
    if (excPanel) excPanel.classList.add('show');
    const e = exc[key];
    if (e && e.text.trim().length > 0) {
      const err = checkRationale(e.text, key);
      if (!err) {
        // Exception is approved but still remains an exception
        ok = true;
        el.classList.add('warn'); // Keep warning state to show it's an exception
        hintEl.className = 'hint warn';
        hintEl.textContent = f.msg + ' (exception approved)';
        if (excRatEl) { excRatEl.className = 'exc-hint hint ok'; excRatEl.textContent = '✓ Exception approved'; }
        state[key] = true;
        return true;
      } else {
        if (excRatEl) { excRatEl.className = 'exc-hint hint err'; excRatEl.textContent = err; }
      }
    } else if (excRatEl) { excRatEl.textContent = ''; }

    if (!ok) {
      el.classList.add('warn');
      hintEl.className = 'hint warn';
      hintEl.textContent = f.msg + ' (add exception if needed)';
      state[key] = false;
      return false;
    }
  } else if (!ok) {
    el.classList.add('err');
    hintEl.className = 'hint err';
    // Special handling for offer letter validation
    if (f.fn && f.fn.toString().includes('offerLetter') && v === 'Yes') {
      hintEl.textContent = 'Offer letter only valid for Cleared or Waitlisted candidates.';
    } else {
      hintEl.textContent = f.msg;
    }
    state[key] = false;
    return false;
  }

  if (excPanel && !excPanel.classList.contains('show') === false) excPanel.classList.remove('show');
  hintEl.className = 'hint ok';
  hintEl.textContent = '✓ Valid';
  state[key] = true;
  return true;
}

function updateBanner() {
  const banner = document.getElementById('errBanner');
  const list = document.getElementById('errList');
  const intStatusEl = document.getElementById('interviewStatus');
  const intVal = intStatusEl ? intStatusEl.value : '';

  // Update exception counter and warning banner
  const exceptionCount = updateExceptionCounter();

  if (intVal === 'Rejected') {
    banner.className = 'error-banner show blocking';
    list.innerHTML = '<li>Rejected candidates cannot be enrolled.</li>';
    document.getElementById('submitBtn').disabled = true;
    return;
  }

  // Check for fields that need attention (either invalid or missing exception rationale)
  const blockingFields = Object.keys(fields).filter(k => {
    const f = fields[k];
    const el = document.getElementById(f.el);
    const v = el.value.trim();
    
    // Field is empty and required
    if (!v) return true;
    
    // Field is invalid and doesn't have an approved exception
    let ok = f.re ? f.re.test(v) : (f.fn ? f.fn(v) : true);
    if (!ok && !f.strict && f.hasException) {
      const e = exc[k];
      if (e && e.text.trim().length > 0) {
        const err = checkRationale(e.text, k);
        return err !== ''; // Blocking if exception rationale is invalid
      }
      return true; // Blocking if no exception provided yet
    }
    return !ok; // Blocking if invalid and no exception allowed
  });

  if (blockingFields.length) {
    banner.className = 'error-banner show';
    list.innerHTML = blockingFields.map(k => {
      const fieldConfig = validationConfig.rules.find(rule => rule.field === k);
      const label = fieldConfig ? fieldConfig.label : k.replace(/([A-Z])/g,' $1').trim();
      return `<li>${label} needs attention</li>`;
    }).join('');
  } else {
    banner.className = 'error-banner';
  }

  // Enable submit if no fields need attention (regardless of exception count)
  const shouldDisable = blockingFields.length > 0 || intVal === 'Rejected';
  document.getElementById('submitBtn').disabled = shouldDisable;
  
  // Debug logging
  console.log('Blocking fields:', blockingFields);
  console.log('Exception count:', exceptionCount);
  console.log('Should disable submit:', shouldDisable);
  
  // Store exception count for submission handling
  window.currentExceptionCount = exceptionCount;
}

function updateProgress() {
  const fieldIds = validationConfig.rules.map(rule => rule.field);
  const filled = fieldIds.filter(id => {
    const el = document.getElementById(id);
    return el && el.value.trim();
  }).length;
  const pct = Math.round(filled / fieldIds.length * 100);
  document.getElementById('pfill').style.width = pct + '%';
  document.getElementById('ppct').textContent = pct + '% complete';
  document.getElementById('pcnt').textContent = filled + ' / ' + fieldIds.length + ' fields';
}

// Bind fields dynamically based on configuration
function bindFieldEvents() {
  Object.keys(fields).forEach(key => {
    const el = document.getElementById(fields[key].el);
    if (el) {
      ['input','change','blur'].forEach(ev => 
        el.addEventListener(ev, () => { 
          validate(key); 
          updateBanner(); 
          updateProgress(); 
        })
      );
    }
  });

  // Exception rationales - bind dynamically
  Object.keys(exc).forEach(key => {
    const ratEl  = document.getElementById(key + 'Rationale');
    if (ratEl) {
      // Update counter in real-time while typing
      ratEl.addEventListener('input', () => { 
        exc[key].text = ratEl.value; 
        updateExceptionCounter(); 
      });
      // Validate only when user finishes typing
      ratEl.addEventListener('blur', () => { 
        validate(key); 
        updateBanner(); 
        updateExceptionCounter(); 
      });
    }
  });
}

// Theme Toggle Functions
function initializeThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.querySelector('.theme-icon');
  
  // Load saved theme or default to light
  const savedTheme = localStorage.getItem('admitguard-theme') || 'light';
  setTheme(savedTheme);
  
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      
      setTheme(newTheme);
      localStorage.setItem('admitguard-theme', newTheme);
    });
  }
}

function setTheme(theme) {
  const themeIcon = document.querySelector('.theme-icon');
  const html = document.documentElement;
  
  if (theme === 'dark') {
    html.setAttribute('data-theme', 'dark');
    if (themeIcon) themeIcon.textContent = '☀️';
  } else {
    html.removeAttribute('data-theme');
    if (themeIcon) themeIcon.textContent = '🌙';
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
  await loadValidationConfig();
  generateFormFromConfig();
  bindFieldEvents();
  
  // Initialize tab navigation
  initializeTabNavigation();
  
  // Initialize audit log clear button
  const clearBtn = document.getElementById('clearLogBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', clearAuditLog);
  }
  
  // Initialize audit log download button
  const downloadBtn = document.getElementById('downloadBtn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', downloadAuditLog);
  }
  
  // Initialize audit log sync button
  const syncBtn = document.getElementById('syncBtn');
  if (syncBtn) {
    syncBtn.addEventListener('click', syncAuditLogFromFile);
  }
  
  // Mode toggle (percentage vs CGPA)
  const modeToggle = document.getElementById('modeToggle');
  if (modeToggle) {
    modeToggle.addEventListener('click', function() {
      this.classList.toggle('on');
      const isP = this.classList.contains('on');
      document.getElementById('modeLabel').textContent = isP ? 'Percentage (%)' : 'CGPA (10-point)';
      document.getElementById('percentageCgpa').placeholder = isP ? '72.5' : '7.8';
      validate('percentageCgpa'); updateBanner();
    });
  }

  // Re-validate offer letter when interview status changes
  const intStatus = document.getElementById('interviewStatus');
  if (intStatus) {
    intStatus.addEventListener('change', () => { 
      // Only validate offerLetterSent if it exists in the current schema
      if (fields['offerLetterSent']) {
        validate('offerLetterSent'); 
      }
      updateBanner(); 
    });
  }

  // Initialize exception counter and progress
  updateExceptionCounter();
  updateProgress();
  
  // Initialize theme toggle
  initializeThemeToggle();
});

// Confirmation Modal Functions
function showConfirmationModal() {
  const modal = document.getElementById('confirmModal');
  populateSummaryData();
  modal.classList.add('show');
  
  // Add event listeners for buttons
  const cancelBtn = document.getElementById('cancelBtn');
  const confirmBtn = document.getElementById('confirmBtn');
  
  // Remove existing listeners to prevent duplicates
  cancelBtn.replaceWith(cancelBtn.cloneNode(true));
  confirmBtn.replaceWith(confirmBtn.cloneNode(true));
  
  // Add fresh listeners
  document.getElementById('cancelBtn').addEventListener('click', hideConfirmationModal);
  document.getElementById('confirmBtn').addEventListener('click', confirmSubmission);
  
  // Close on overlay click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      hideConfirmationModal();
    }
  });
  
  // Close on Escape key
  document.addEventListener('keydown', handleEscapeKey);
}

function hideConfirmationModal() {
  const modal = document.getElementById('confirmModal');
  modal.classList.remove('show');
  document.removeEventListener('keydown', handleEscapeKey);
}

function handleEscapeKey(e) {
  if (e.key === 'Escape') {
    hideConfirmationModal();
  }
}

function populateSummaryData() {
  const formData = {};
  validationConfig.rules.forEach(rule => {
    const el = document.getElementById(rule.field);
    if (el) {
      formData[rule.field] = el.value;
    }
  });
  
  // Unified Summary Section - Tabular Format
  const formSummary = document.getElementById('formSummary');
  formSummary.innerHTML = `
    <table class="summary-table">
      <thead>
        <tr>
          <th>Field</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        ${generateSummaryTableRows(formData)}
      </tbody>
    </table>
  `;
  
  // Exceptions Section
  const exceptionsSection = document.getElementById('exceptionsSection');
  const exceptionsList = document.getElementById('exceptionsList');
  const exceptionBadge = document.getElementById('exceptionBadge');
  
  const activeExceptions = [];
  Object.keys(exc).forEach(key => {
    if (exc[key] && exc[key].text && exc[key].text.trim().length > 0) {
      activeExceptions.push({
        field: key,
        rationale: exc[key].text.trim()
      });
    }
  });
  
  if (activeExceptions.length > 0) {
    exceptionsSection.style.display = 'block';
    exceptionBadge.textContent = activeExceptions.length;
    
    exceptionsList.innerHTML = activeExceptions.map(exc => {
      const fieldConfig = validationConfig.rules.find(rule => rule.field === exc.field);
      const fieldLabel = fieldConfig ? fieldConfig.label : exc.field;
      return `
        <div class="exception-item">
          <div class="exception-field">${fieldLabel}</div>
          <div class="exception-rationale">${exc.rationale}</div>
        </div>
      `;
    }).join('');
  } else {
    exceptionsSection.style.display = 'none';
  }
  
  // Flagged Warning
  const flaggedWarning = document.getElementById('flaggedWarning');
  if (activeExceptions.length > 2) {
    flaggedWarning.style.display = 'block';
  } else {
    flaggedWarning.style.display = 'none';
  }
}

function generateSummaryTableRows(formData) {
  // Add all fields in a logical order
  const fieldOrder = [
    'fullName', 'email', 'phone', 'aadhaarNumber',
    'highestQualification', 'graduationYear', 'percentageCgpa', 'screeningScore',
    'interviewStatus', 'offerLetterSent'
  ];
  
  let rows = '';
  
  fieldOrder.forEach(fieldKey => {
    if (formData[fieldKey]) {
      const fieldConfig = validationConfig.rules.find(rule => rule.field === fieldKey);
      const label = fieldConfig ? fieldConfig.label : fieldKey.replace(/([A-Z])/g, ' $1').trim();
      
      // Special handling for percentage/CGPA mode
      let displayValue = formData[fieldKey];
      if (fieldKey === 'percentageCgpa') {
        const modeLabel = document.getElementById('modeLabel').textContent;
        displayValue = `${formData[fieldKey]} (${modeLabel})`;
      }
      
      rows += `
        <tr>
          <td class="summary-table-label">${label}</td>
          <td class="summary-table-value">${displayValue}</td>
        </tr>
      `;
    }
  });
  
  // Add flagged status if present
  if (formData.flagged) {
    rows += `
      <tr class="flagged-row">
        <td class="summary-table-label">Flagged for Review</td>
        <td class="summary-table-value warning">Yes - ${formData.flagReason || 'Multiple exceptions'}</td>
      </tr>
    `;
  }
  
  return rows;
}

function createSummaryItem(label, value) {
  return `
    <div class="summary-item">
      <span class="summary-label">${label}</span>
      <span class="summary-value">${value}</span>
    </div>
  `;
}

function confirmSubmission() {
  hideConfirmationModal();
  
  // Proceed with the actual submission
  performSubmission();
}

function performSubmission() {
  console.log('🚀 Form submission confirmed');
  
  // Prepare submission data using configuration
  const formData = {};
  validationConfig.rules.forEach(rule => {
    const el = document.getElementById(rule.field);
    if (el) {
      formData[rule.field] = el.value;
    }
  });
  
  // Add exception data
  formData.exceptions = {};
  Object.keys(exc).forEach(key => {
    if (exc[key] && exc[key].text && exc[key].text.trim().length > 0) {
      formData.exceptions[key] = {
        active: true,
        rationale: exc[key].text.trim()
      };
    }
  });
  
  console.log('Exception data collected:', formData.exceptions);
  
  // Flag record if more than 2 exceptions
  const exceptionCount = countActiveExceptions();
  if (exceptionCount > 2) {
    formData.flagged = true;
    formData.flagReason = 'High exception count';
    console.log('🚩 Record flagged for manager review - Exception count:', exceptionCount);
  } else {
    formData.flagged = false;
  }
  
  // Simulate submission (in real app, this would be an API call)
  console.log('Submitting form data:', formData);
  
  // Add to audit log before showing success message
  addAuditEntry(formData);
  
  // Show audit trail notification
  setTimeout(() => {
    const auditTab = document.querySelector('[data-tab="audit"]');
    if (auditTab) {
      auditTab.style.background = '#e8f0ea';
      auditTab.style.color = '#2d5a3d';
      auditTab.textContent = 'Audit Trail (New Entry!)';
      
      setTimeout(() => {
        auditTab.style.background = '';
        auditTab.style.color = '';
        auditTab.textContent = 'Audit Trail';
      }, 3000);
    }
  }, 1000);
  
  // Show success message
  const banner = document.getElementById('errBanner');
  const list = document.getElementById('errList');
  banner.className = 'error-banner show';
  banner.style.background = '#e8f0ea';
  banner.style.borderColor = '#2d5a3d';
  banner.style.color = '#2d5a3d';
  
  if (formData.flagged) {
    list.innerHTML = '<li>✓ Application submitted successfully! This entry has been flagged for manager review due to multiple exceptions.</li>';
  } else {
    list.innerHTML = '<li>✓ Application submitted successfully!</li>';
  }
  
  // Reset form immediately after successful submission
  document.getElementById('theForm').reset();
  
  // Reset exception data and close all exception panels
  Object.keys(exc).forEach(key => {
    exc[key] = { text: '' };
    const excPanel = document.getElementById(key + 'Exc');
    if (excPanel) {
      excPanel.classList.remove('show');
    }
    const excRatEl = document.getElementById(key + 'Rationale');
    if (excRatEl) {
      excRatEl.value = '';
    }
  });
  
  // Reset validation state
  Object.keys(state).forEach(key => state[key] = false);
  
  // Reset mode toggle to Percentage mode
  const modeToggle = document.getElementById('modeToggle');
  const modeLabel = document.getElementById('modeLabel');
  if (modeToggle && modeLabel) {
    modeToggle.classList.add('on');
    modeLabel.textContent = 'Percentage (%)';
    document.getElementById('percentageCgpa').placeholder = '72.5';
  }
  
  // Clear all field validation states
  validationConfig.rules.forEach(rule => {
    const el = document.getElementById(rule.field);
    const hintEl = document.getElementById(rule.field + 'Hint');
    if (el) {
      el.classList.remove('err', 'warn');
    }
    if (hintEl) {
      hintEl.className = 'hint';
      hintEl.textContent = '';
    }
  });
  
  // Update UI components
  updateBanner();
  updateProgress();
  updateExceptionCounter();
  
  // Reset banner after 3 seconds
  setTimeout(() => {
    banner.className = 'error-banner';
    banner.style = '';
  }, 3000);
}

// Submit
document.addEventListener('submit', e => {
  if (e.target.id !== 'theForm') return;
  
  console.log('🚀 Form submission triggered');
  e.preventDefault();
  Object.keys(fields).forEach(k => validate(k));
  updateBanner();
  
  const allOk = Object.keys(fields).every(k => state[k] === true);
  const intStatusEl = document.getElementById('interviewStatus');
  const intVal = intStatusEl ? intStatusEl.value : '';
  
  console.log('Validation state:', { allOk, intVal, state });
  
  if (!allOk || intVal === 'Rejected') {
    console.log('❌ Submission blocked - validation failed');
    return; // Don't submit if validation fails
  }
  
  console.log('✅ Validation passed, showing confirmation modal');
  
  // Show confirmation modal instead of direct submission
  showConfirmationModal();
});

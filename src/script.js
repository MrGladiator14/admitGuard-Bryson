// Configuration-driven validation engine
let validationConfig = {};
let fields = {};
let exc = {};
let state = {};

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
                               rule.field === 'offerLetterSent' ? 'Select option' : '';
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
      
      // Exception checkbox
      const excCheck = document.createElement('div');
      excCheck.className = 'exc-check';
      
      const excCheckbox = document.createElement('input');
      excCheckbox.type = 'checkbox';
      excCheckbox.id = rule.field + 'ExcToggle';
      
      const excLabel = document.createElement('label');
      excLabel.setAttribute('for', rule.field + 'ExcToggle');
      excLabel.textContent = 'Request Exception';
      
      excCheck.appendChild(excCheckbox);
      excCheck.appendChild(excLabel);
      exceptionPanel.appendChild(excCheck);
      
      // Exception rationale textarea
      const excTextarea = document.createElement('textarea');
      excTextarea.className = 'exc-ta';
      excTextarea.id = rule.field + 'Rationale';
      excTextarea.placeholder = 'Provide justification...';
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
    return e && e.on && checkRationale(e.text, key) === '';
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
    if (e && e.on) {
      const err = checkRationale(e.text, key);
      if (!err) {
        ok = true;
        if (excRatEl) { excRatEl.className = 'exc-hint hint ok'; excRatEl.textContent = '✓ Exception approved'; }
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
  const intVal = document.getElementById('interviewStatus').value;

  // Update exception counter and warning banner
  const exceptionCount = updateExceptionCounter();

  if (intVal === 'Rejected') {
    banner.className = 'error-banner show blocking';
    list.innerHTML = '<li>Rejected candidates cannot be enrolled.</li>';
    document.getElementById('submitBtn').disabled = true;
    return;
  }

  const errors = Object.keys(fields).filter(k => state[k] === false).map(k => fields[k].msg);
  if (errors.length) {
    banner.className = 'error-banner show';
    list.innerHTML = errors.map(e => `<li>${e}</li>`).join('');
  } else {
    banner.className = 'error-banner';
  }

  const allOk = Object.keys(fields).every(k => state[k] === true);
  // Never disable submit button based on exception count - only validation status
  document.getElementById('submitBtn').disabled = !allOk || intVal === 'Rejected';
  
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

  // Exception toggles & rationales - bind dynamically
  Object.keys(exc).forEach(key => {
    const toggle = document.getElementById(key + 'ExcToggle');
    const ratEl  = document.getElementById(key + 'Rationale');
    if (toggle) {
      toggle.addEventListener('change', () => { 
        exc[key].on = toggle.checked; 
        validate(key); 
        updateBanner(); 
        updateExceptionCounter(); 
      });
    }
    if (ratEl) {
      ratEl.addEventListener('input', () => { 
        exc[key].text = ratEl.value; 
        validate(key); 
        updateBanner(); 
        updateExceptionCounter(); 
      });
    }
  });
}

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
  await loadValidationConfig();
  generateFormFromConfig();
  bindFieldEvents();
  
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
      validate('offerLetterSent'); 
      updateBanner(); 
    });
  }

  // Initialize exception counter and progress
  updateExceptionCounter();
  updateProgress();
});

// Submit
document.addEventListener('submit', e => {
  if (e.target.id !== 'theForm') return;
  
  e.preventDefault();
  Object.keys(fields).forEach(k => validate(k));
  updateBanner();
  
  const allOk = Object.keys(fields).every(k => state[k] === true);
  const intVal = document.getElementById('interviewStatus').value;
  
  if (!allOk || intVal === 'Rejected') {
    return; // Don't submit if validation fails
  }
  
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
    if (exc[key].on) {
      formData.exceptions[key] = {
        active: exc[key].on,
        rationale: exc[key].text
      };
    }
  });
  
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
  
  // Reset form after 3 seconds
  setTimeout(() => {
    document.getElementById('theForm').reset();
    Object.keys(exc).forEach(key => {
      exc[key] = { on: false, text: '' };
    });
    Object.keys(state).forEach(key => state[key] = false);
    updateBanner();
    updateProgress();
    banner.className = 'error-banner';
    banner.style = '';
  }, 3000);
});

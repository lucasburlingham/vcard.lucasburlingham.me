const form = document.getElementById('cardForm');
const output = document.getElementById('output');
const copyButton = document.getElementById('copyButton');
const downloadButton = document.getElementById('downloadButton');
const fillExampleButton = document.getElementById('fillExample');
const resetButton = document.getElementById('resetForm');
const statusPill = document.getElementById('statusPill');

const encoder = new TextEncoder();

function normalizeValue(value) {
  return value.trim();
}

function escapeText(value) {
  return value
    .replaceAll('\\', '\\\\')
    .replaceAll('\r\n', '\n')
    .replaceAll('\r', '\n')
    .replaceAll('\n', '\\n')
    .replaceAll(';', '\\;')
    .replaceAll(',', '\\,');
}

function escapeParameterValue(value) {
  return value.replaceAll('\\', '\\\\').replaceAll('"', '\\"');
}

function needsQuoting(value) {
  return /[,:;\s"]/.test(value);
}

function formatParameter(name, value) {
  if (!value) {
    return '';
  }

  const safeValue = String(value);
  return `${name}=${needsQuoting(safeValue) ? `"${escapeParameterValue(safeValue)}"` : safeValue}`;
}

function contentLine(name, value, parameters = []) {
  const parts = [name.toUpperCase()];
  const filteredParameters = parameters.filter(Boolean);
  if (filteredParameters.length) {
    parts.push(`;${filteredParameters.join(';')}`);
  }
  parts.push(`:${value}`);
  return parts.join('');
}

function foldLine(line) {
  const chars = Array.from(line);
  let folded = '';
  let currentBytes = 0;

  for (let index = 0; index < chars.length; index += 1) {
    const char = chars[index];
    const charBytes = encoder.encode(char).length;
    const limit = currentBytes === 0 ? 75 : 75;

    if (currentBytes > 0 && currentBytes + charBytes > limit) {
      folded += '\r\n ';
      currentBytes = 0;
    }

    folded += char;
    currentBytes += charBytes;
  }

  return folded;
}

function foldContentLines(lines) {
  return lines.map(foldLine).join('\r\n');
}

function buildDisplayName(data) {
  const parts = [data.prefix, data.givenName, data.additionalNames, data.familyName, data.suffix]
    .map(normalizeValue)
    .filter(Boolean);

  return data.displayName || parts.join(' ').replace(/\s+/g, ' ').trim() || 'Unnamed contact';
}

function buildStructuredName(data) {
  return [data.familyName, data.givenName, data.additionalNames, data.prefix, data.suffix]
    .map(escapeText)
    .join(';');
}

function buildVCard(data) {
  const lines = [
    contentLine('BEGIN', 'VCARD'),
    contentLine('VERSION', '4.0'),
  ];

  const fn = escapeText(buildDisplayName(data));
  const structuredName = buildStructuredName(data);

  lines.push(contentLine('FN', fn));
  lines.push(contentLine('N', structuredName));

  if (data.organization) {
    lines.push(contentLine('ORG', escapeText(data.organization)));
  }

  if (data.title) {
    lines.push(contentLine('TITLE', escapeText(data.title)));
  }

  if (data.email) {
    lines.push(contentLine('EMAIL', escapeText(data.email), [formatParameter('TYPE', 'work')]));
  }

  if (data.phone) {
    const tel = `tel:${data.phone.replace(/[^+\dA-Za-z*#.]/g, '')}`;
    lines.push(contentLine('TEL', escapeText(tel), [formatParameter('VALUE', 'uri'), formatParameter('TYPE', 'voice,cell')]));
  }

  if (data.url) {
    lines.push(contentLine('URL', escapeText(data.url)));
  }

  if (data.street || data.city || data.region || data.postalCode || data.country) {
    const adr = [
      '',
      '',
      data.street || '',
      data.city || '',
      data.region || '',
      data.postalCode || '',
      data.country || '',
    ].map(escapeText).join(';');
    lines.push(contentLine('ADR', adr, [formatParameter('TYPE', data.addressType || 'work')]));
  }

  if (data.note) {
    lines.push(contentLine('NOTE', escapeText(data.note)));
  }

  lines.push(contentLine('UID', `urn:uuid:${crypto.randomUUID()}`));
  lines.push(contentLine('REV', new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')));
  lines.push(contentLine('END', 'VCARD'));

  return foldContentLines(lines);
}

function getFormData() {
  const formData = new FormData(form);
  return Object.fromEntries(formData.entries());
}

function updateOutput(message = 'Updated') {
  const data = getFormData();
  const card = buildVCard(data);
  output.value = card;
  statusPill.textContent = message;
  return card;
}

async function copyOutput() {
  try {
    await navigator.clipboard.writeText(output.value);
    statusPill.textContent = 'Copied to clipboard';
  } catch {
    statusPill.textContent = 'Copy failed';
  }
}

function downloadOutput() {
  const blob = new Blob([output.value], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'contact.vcf';
  anchor.click();
  URL.revokeObjectURL(url);
  statusPill.textContent = 'Download ready';
}

function loadExample() {
  const example = {
    givenName: 'Ada',
    familyName: 'Lovelace',
    additionalNames: 'Byron',
    prefix: 'Countess',
    suffix: '',
    displayName: 'Ada Lovelace',
    email: 'ada@example.com',
    phone: '+1 212 555 0147',
    organization: 'Analytical Engines LLC',
    title: 'Mathematician',
    url: 'https://example.com',
    note: 'Generated from a static RFC 6350 vCard app.',
    street: '12 Machine Street',
    city: 'New York',
    region: 'NY',
    postalCode: '10001',
    country: 'United States',
    addressType: 'work',
  };

  Object.entries(example).forEach(([name, value]) => {
    const field = form.elements.namedItem(name);
    if (field) {
      field.value = value;
    }
  });

  updateOutput('Example loaded');
}

form.addEventListener('input', () => updateOutput('Updated'));
form.addEventListener('submit', (event) => {
  event.preventDefault();
  updateOutput('Generated');
});
copyButton.addEventListener('click', copyOutput);
downloadButton.addEventListener('click', downloadOutput);
fillExampleButton.addEventListener('click', loadExample);
resetButton.addEventListener('click', () => {
  form.reset();
  updateOutput('Cleared');
});

updateOutput('Ready');

const parseCSV = (text) => {
  const lines = text.trim().split('\n');
  if (lines.length === 0) return [];
  const headers = parseCSVLine(lines[0]);
  return lines.slice(1).map(line => {
    const values = parseCSVLine(line);
    return headers.reduce((obj, key, i) => {
      obj[key.trim()] = values[i]?.trim() || '';
      return obj;
    }, {});
  }).filter(obj => Object.values(obj).some(v => v !== '')); 
};
const parseCSVLine = (line) => {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
};
const loadCSV = async (relPath) => {
  try {
    const response = await fetch(relPath);
    if (!response.ok) {
      throw new Error(`Failed to load ${relPath} (Status: ${response.status})`);
    }
    const text = await response.text();
    const parsed = parseCSV(text);
    return parsed;
  } catch (error) {
    throw error;
  }
};
const getCategories = async () => {
  try {
    const response = await fetch('./scripts/soal/manifest.json');
    if (!response.ok) throw new Error(`Failed to fetch manifest (Status: ${response.status})`);
    const data = await response.json();
    const categoriesObj = data.categories || {};
    const categories = Object.keys(categoriesObj);
    if (categories.length === 0) throw new Error('No categories found in manifest');
    return categories;
  } catch (error) {
    return ['Matematika', 'Sains', 'Sejarah', 'Pengetahuan Umum'];
  }
};
const getSOALFilesInCategory = async (category) => {
  try {
    const response = await fetch('./scripts/soal/manifest.json');
    if (!response.ok) throw new Error(`Failed to fetch manifest (Status: ${response.status})`);
    const data = await response.json();
    const files = data.categories?.[category] || [];
    return files;
  } catch (error) {
    return [];
  }
};
const loadCategorySOAL = async (category) => {
  try {
    const files = await getSOALFilesInCategory(category);
    const categoryQuestions = [];
    for (const filename of files) {
      try {
        const relPath = `./scripts/soal/${category}/${filename}`;
        const parsed = await loadCSV(relPath);
        categoryQuestions.push(...parsed);
      } catch (err) {
      }
    }
    return categoryQuestions;
  } catch (error) {
    return [];
  }
};
const loadAllSOAL = async () => {
  const categories = await getCategories();
  if (!categories || categories.length === 0) {
    return {};
  }
  const allSOAL = {};
  for (const category of categories) {
    try {
      allSOAL[category] = await loadCategorySOAL(category);
    } catch (error) {
      allSOAL[category] = [];
    }
  }
  return allSOAL;
};
const getQuestions = (allSOAL, category) => {
  return allSOAL[category] || [];
};
const getQuestion = (allSOAL, category, id) => {
  const questions = getQuestions(allSOAL, category);
  return questions.find(q => q.id == id) || null;
};
const getRandomQuestions = (questions, count = 10) => {
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
};
const getAllCategories = (allSOAL) => {
  return Object.keys(allSOAL);
};
const getCategoryQuestionCount = (allSOAL, category) => {
  const questions = allSOAL[category] || [];
  return questions.length;
};
const getFileQuestionCount = async (category, filename) => {
  try {
    const relPath = `./scripts/soal/${category}/${filename}`;
    const response = await fetch(relPath);
    if (!response.ok) throw new Error(`File not found: ${relPath}`);
    const text = await response.text();
    const parsed = parseCSV(text);
    return parsed.length;
  } catch (error) {
    return 0;
  }
};

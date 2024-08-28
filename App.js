import React, { useState } from 'react';
import './App.css';

function App() {
  const [names, setNames] = useState([{ name: '', isCaptain: false }]);
  const [result, setResult] = useState([]);
  const [groupSize, setGroupSize] = useState(2);
  const [customGroupSize, setCustomGroupSize] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]); // Stan do przechowywania błędów

  const handleNameChange = (index, value) => {
    const newNames = [...names];
    newNames[index].name = value;
    setNames(newNames);
    validateNames(newNames); // Walidacja podczas zmiany nazwy
  };

  const toggleCaptain = (index) => {
    const newNames = [...names];
    newNames[index].isCaptain = !newNames[index].isCaptain;
    setNames(newNames);
  };

  const addNameBox = () => {
    setNames([...names, { name: '', isCaptain: false }]);
  };

  const removeNameBox = (index) => {
    const newNames = [...names];
    newNames.splice(index, 1);
    setNames(newNames);
    validateNames(newNames); // Walidacja po usunięciu nazwy
  };

  const validateNames = (names) => {
    const uniqueNames = new Set();
    const newErrors = names.map((person) => {
      if (person.name.trim() === '') {
        return false; // Pole puste
      }
      if (uniqueNames.has(person.name.toLowerCase())) {
        return true; // Duplikat
      }
      uniqueNames.add(person.name.toLowerCase());
      return false; // Brak błędu
    });
    setErrors(newErrors);
    return newErrors.every(error => !error);
  };

  const handleSubmit = async () => {
    if (!validateNames(names)) {
      alert('Duplikaty!!!');
      return;
    }
    setLoading(true);
    const filteredNames = names.filter(person => person.name.trim() !== '');
    const size = customGroupSize ? parseInt(customGroupSize, 10) : groupSize;

    if (filteredNames.length < size) {
      alert('Liczba osób jest mniejsza niż rozmiar grupy.');
      setLoading(false);
      return;
    }

    const response = await fetch('http://localhost:5005/api/losowanie', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ names: filteredNames, groupSize: size }),
    });

    if (response.ok) {
      const data = await response.json();
      setResult(data);
    } else {
      alert('Wystąpił błąd podczas losowania grup.');
    }
    setLoading(false);
  };

  const handleSave = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'result.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadTxt = () => {
    window.location.href = 'http://localhost:5005/download-results';
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1><a href="/" className="logo-link">Losowanie Par</a></h1>
      </header>
      <div className="instructions">
        <h3>Instrukcja obsługi</h3>
        <p>1. Wprowadź imiona w pola tekstowe.</p>
        <p>2. Wybierz rozmiar grupy: Pary, Trójki lub wpisz własny rozmiar grupy.</p>
        <p>3. Kliknij "Losuj", aby wylosować grupy.</p>
        <p>4. Wyniki można zapisać, klikając "Zapisz wynik".</p>
        <p>5. Użyj przycisków "Dodaj" i "Usuń", aby zarządzać imionami.</p>
        <p>6. Kliknij na gwiazdkę obok imienia, aby oznaczyć je jako kapitana grupy.</p>
      </div>
      <div>
        <button onClick={() => setGroupSize(2)} className={groupSize === 2 && !customGroupSize ? 'active' : ''}>Pary</button>
        <button onClick={() => setGroupSize(3)} className={groupSize === 3 && !customGroupSize ? 'active' : ''}>Trójki</button>
        <input
          type="number"
          value={customGroupSize}
          onChange={(e) => setCustomGroupSize(e.target.value)}
          placeholder="Wpisz rozmiar grupy"
        />
      </div>
      <div>
        {names.map((person, index) => (
          <div className="name-input-container" key={index}>
            <input
              type="text"
              value={person.name}
              onChange={(e) => handleNameChange(index, e.target.value)}
              placeholder="Wpisz imię"
              className={errors[index] ? 'input-error' : ''} // Dodanie klasy błędu
            />
            <button onClick={() => toggleCaptain(index)} className={`captain-button ${person.isCaptain ? 'captain' : ''}`}>
              {person.isCaptain ? '⭐' : '☆'}
            </button>
            <button onClick={() => removeNameBox(index)} className="remove-button">Usuń</button>
          </div>
        ))}
        <button onClick={addNameBox} className="add-button">Dodaj</button>
      </div>
      <button onClick={handleSubmit} className={`submit-button ${loading ? 'loading' : ''}`}>
        {loading ? 'Losowanie...' : 'Losuj'}
      </button>
      <button onClick={handleSave} className="save-button">Zapisz wynik (JSON)</button>
      <button onClick={handleDownloadTxt} className="download-txt-button">Pobierz wyniki (TXT)</button>
      <div className="result">
        <h2>{groupSize === 2 && !customGroupSize ? 'Pary' : (groupSize === 3 && !customGroupSize ? 'Trójki' : `Grupy po ${customGroupSize}`)}</h2>
        <table>
          <thead>
            <tr>
              <th>Grupa</th>
              <th>Imiona</th>
            </tr>
          </thead>
          <tbody>
            {result.map((group, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td className="name">{group.map(person => person.isCaptain ? `⭐ ${person.name}` : person.name).join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
